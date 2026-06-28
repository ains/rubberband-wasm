import { RubberBandOption } from "./RubberBandInterface";

export interface RubberBandNodeOptions {
  /** URL of the bundled worklet processor (dist/rubberband-processor.js). */
  processorUrl?: string;
  /** URL to fetch the rubberband.wasm binary from. */
  wasmUrl?: string;
  /** Pre-fetched wasm binary (compiled inside the worklet). */
  wasmBinary?: ArrayBuffer | Uint8Array;
  /** Number of output channels (default 2). Sources are up/down-mixed to this. */
  channelCount?: number;
  /** RubberBand options bitmask (advanced; defaults to a real-time, glitch-free preset). */
  options?: number;
}

// Tracks which contexts have already had the worklet module registered.
const moduleAdded = new WeakSet<BaseAudioContext>();

/**
 * RubberBandNode — a Web Audio source node that plays a buffer through Rubber
 * Band Library with live, real-time control over tempo (time-stretch) and pitch.
 *
 * It has no inputs and one output; connect it to the graph like an
 * AudioBufferSourceNode:
 *
 * ```js
 * const node = await RubberBandNode.create(ctx, {
 *   processorUrl: "rubberband-processor.js",
 *   wasmUrl: "rubberband.wasm",
 *   channelCount: audioBuffer.numberOfChannels,
 * });
 * node.connect(ctx.destination);
 * node.setBuffer(audioBuffer);
 * node.setTempo(1.5);          // 1.5x speed, pitch unchanged
 * node.setPitchSemitones(-3);  // down a minor third, speed unchanged
 * node.play();
 * ```
 */
export class RubberBandNode extends AudioWorkletNode {
  private readonly _channels: number;
  private readonly _sourceSampleRate: number;
  private _ready: Promise<void>;
  private _readyResolve!: () => void;
  private _readyReject!: (err: Error) => void;

  /** Fired once when playback reaches the end (re-armed on every play/seek/stop). */
  onended: (() => void) | null = null;
  /** Fired periodically with the current playback position, in seconds of source time. */
  onposition: ((seconds: number) => void) | null = null;

  private constructor(context: BaseAudioContext, channels: number) {
    super(context, "rubberband-processor", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [channels],
    });
    this._channels = channels;
    this._sourceSampleRate = context.sampleRate;
    this._ready = new Promise<void>((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
    this.port.onmessage = (e: MessageEvent) => {
      const d = e.data;
      if (!d) return;
      if (d.type === "ready") this._readyResolve();
      else if (d.type === "error") this._readyReject(new Error("RubberBand worklet init failed: " + d.error));
      else if (d.type === "ended") this.onended && this.onended();
      else if (d.type === "position") this.onposition && this.onposition(d.seconds);
    };
  }

  /** Number of output channels the node was created with. */
  get sourceChannels(): number {
    return this._channels;
  }

  /** Resolves once the worklet has compiled the wasm and is ready to play. */
  get ready(): Promise<void> {
    return this._ready;
  }

  /** Register the worklet module on a context (idempotent per context). */
  static async addModule(context: BaseAudioContext, processorUrl: string): Promise<void> {
    if (!moduleAdded.has(context)) {
      await context.audioWorklet.addModule(processorUrl);
      moduleAdded.add(context);
    }
  }

  /** Create a ready-to-use RubberBandNode. */
  static async create(context: BaseAudioContext, opts: RubberBandNodeOptions = {}): Promise<RubberBandNode> {
    if (typeof AudioWorkletNode === "undefined" || !context.audioWorklet) {
      throw new Error("AudioWorklet is not supported in this AudioContext.");
    }
    const processorUrl = opts.processorUrl || "rubberband-processor.js";
    await RubberBandNode.addModule(context, processorUrl);

    // The worklet compiles the wasm itself: a compiled WebAssembly.Module cannot
    // be reliably structured-cloned into an AudioWorkletGlobalScope, but bytes can.
    let bytes: ArrayBuffer;
    if (opts.wasmBinary) {
      const b = opts.wasmBinary;
      bytes = b instanceof Uint8Array ? b.slice().buffer : b.slice(0);
    } else if (opts.wasmUrl) {
      bytes = await (await fetch(opts.wasmUrl)).arrayBuffer();
    } else {
      throw new Error("RubberBandNode.create requires one of: wasmBinary, wasmUrl.");
    }

    const channels = opts.channelCount && opts.channelCount > 0 ? opts.channelCount : 2;
    const node = new RubberBandNode(context, channels);
    node.port.postMessage({ type: "initialise", wasm: bytes, channels, options: opts.options }, [bytes]);
    await node._ready;
    return node;
  }

  /**
   * Load source audio. Channel data is copied before transfer, so the supplied
   * AudioBuffer/arrays are left intact. Resets the transport to the start.
   */
  setBuffer(buffer: AudioBuffer | Float32Array[]): void {
    let chans: Float32Array[];
    let rate: number;
    if (Array.isArray(buffer)) {
      chans = buffer.map((c) => new Float32Array(c));
      rate = this._sourceSampleRate;
    } else {
      rate = buffer.sampleRate;
      chans = [];
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        chans.push(new Float32Array(buffer.getChannelData(ch)));
      }
    }
    chans = this._normalizeChannels(chans);
    const transfer = chans.map((c) => c.buffer);
    this.port.postMessage({ type: "buffer", channels: chans, sampleRate: rate }, transfer);
  }

  // Up/down-mix to exactly this._channels with distinct backing buffers
  // (so every entry in the transfer list is unique).
  private _normalizeChannels(chans: Float32Array[]): Float32Array[] {
    const n = this._channels;
    if (chans.length === n) return chans;
    const out: Float32Array[] = [];
    for (let ch = 0; ch < n; ch++) {
      const src = chans[ch < chans.length ? ch : chans.length - 1] || new Float32Array(0);
      out.push(ch < chans.length ? src : new Float32Array(src));
    }
    return out;
  }

  /** Start (or restart, if previously ended) playback. */
  play(): void {
    this.port.postMessage({ type: "play" });
  }

  /** Pause, keeping the current position. */
  pause(): void {
    this.port.postMessage({ type: "pause" });
  }

  /** Stop and rewind to the start. */
  stop(): void {
    this.port.postMessage({ type: "stop" });
  }

  /** Seek to a position in seconds of source time. */
  seek(seconds: number): void {
    this.port.postMessage({ type: "seek", seconds });
  }

  /** Enable/disable looping. */
  set loop(value: boolean) {
    this.port.postMessage({ type: "loop", value });
  }

  /** Set playback speed (1 = normal, 2 = double speed) without changing pitch. */
  setTempo(speed: number): void {
    this.port.postMessage({ type: "speed", value: speed });
  }

  /** Set the time ratio directly (output duration / input duration). */
  setTimeRatio(ratio: number): void {
    this.port.postMessage({ type: "speed", value: ratio > 0 ? 1 / ratio : 1 });
  }

  /** Set the pitch scale directly (1 = no shift, 2 = up one octave). */
  setPitchScale(scale: number): void {
    this.port.postMessage({ type: "pitch", value: scale });
  }

  /** Set the pitch shift in semitones (without changing tempo). */
  setPitchSemitones(semitones: number): void {
    this.port.postMessage({ type: "pitch", value: Math.pow(2, semitones / 12) });
  }

  /** Free wasm resources in the worklet and disconnect the node. */
  close(): void {
    this.port.postMessage({ type: "close" });
    this.disconnect();
    this.port.onmessage = null;
  }
}

/** Default RubberBand options used by the real-time node (exported for reference/override). */
export const RUBBERBAND_REALTIME_DEFAULT_OPTIONS =
  RubberBandOption.RubberBandOptionProcessRealTime |
  RubberBandOption.RubberBandOptionEngineFaster |
  RubberBandOption.RubberBandOptionPitchHighConsistency;
