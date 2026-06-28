import { RubberBandInterface, RubberBandOption } from "./RubberBandInterface";

/**
 * RubberBandProcessor — an AudioWorkletProcessor that performs real-time
 * time-stretching and pitch-shifting of a buffered source using Rubber Band
 * Library (RealTime mode), and emits the result into the Web Audio graph.
 *
 * It is a *source* node: it owns the source PCM and controls its own input
 * read-rate. This is what makes real-time time-stretching possible — a pure
 * pass-through effect cannot time-stretch a live stream without unbounded
 * buffering.
 *
 * This file runs in the AudioWorkletGlobalScope and is bundled standalone
 * (it must not pull in `RubberBandNode`, which extends `AudioWorkletNode` —
 * a class that does not exist in the worklet scope).
 */

const RENDER_QUANTUM = 128; // frames per process() call
const MAX_BLOCK = 8192; // max frames fed to / retrieved from RB per call (scratch size)
const RING_CAPACITY = 1 << 16; // per-channel output ring buffer size (frames), power of two
const BUFFER_TARGET = 4096; // frames to keep buffered ahead in the output ring
const PUMP_BUDGET = 256; // max feed/drain cycles per process() call (render-deadline guard)

const DEFAULT_OPTIONS =
  RubberBandOption.RubberBandOptionProcessRealTime |
  RubberBandOption.RubberBandOptionEngineFaster |
  // Required for click-free pitch changes that vary over time and cross 1.0,
  // which is exactly what live pitch control does (R2 engine only).
  RubberBandOption.RubberBandOptionPitchHighConsistency;

class RubberBandProcessor extends AudioWorkletProcessor {
  private rb: RubberBandInterface | null = null;
  private state = 0;
  private channels = 0;
  private options = DEFAULT_OPTIONS;
  private closed = false;

  // wasm scratch (de-interleaved): pointer arrays + per-channel data buffers
  private inPtr = 0;
  private outPtr = 0;
  private inChan: number[] = [];
  private outChan: number[] = [];

  // source material
  private source: Float32Array[] = [];
  private sourceLen = 0;
  private sourceSampleRate = sampleRate;
  private rateFactor = 1; // contextRate / sourceRate

  // transport
  private readPos = 0;
  private playing = false;
  private loop = false;
  private finished = false;
  private sentFinal = false;
  private endedPosted = false;
  private startPad = 0; // leading silent input frames still to inject
  private toDrop = 0; // output frames still to discard (start delay)

  // ratios (user-facing)
  private speed = 1; // playback speed; timeRatio = rateFactor / speed
  private pitchScale = 1; // 1.0 = no shift

  // output ring buffer (shared indices; one Float32Array per channel)
  private ring: Float32Array[] = [];
  private ringRead = 0;
  private ringWrite = 0;
  private ringCount = 0;

  private framesSinceReport = 0;

  constructor() {
    super();
    this.port.onmessage = (e: MessageEvent) => this.onMessage(e.data);
  }

  private async onMessage(msg: any) {
    if (this.closed) return;
    switch (msg && msg.type) {
      case "initialise":
        await this.initialise(msg);
        break;
      case "buffer":
        this.setBuffer(msg);
        break;
      case "play":
        if (this.finished) this.resetTransport(0);
        this.endedPosted = false;
        this.preroll();
        this.playing = true;
        break;
      case "pause":
        this.playing = false;
        break;
      case "stop":
        this.playing = false;
        this.resetTransport(0);
        break;
      case "seek": {
        const frame = Math.max(0, Math.round((msg.seconds || 0) * this.sourceSampleRate));
        this.resetTransport(Math.min(frame, this.sourceLen));
        if (this.playing) this.preroll();
        break;
      }
      case "loop":
        this.loop = !!msg.value;
        break;
      case "speed":
        this.speed = msg.value > 0 ? msg.value : 1;
        this.applyRatios();
        break;
      case "pitch":
        this.pitchScale = msg.value > 0 ? msg.value : 1;
        this.applyRatios();
        break;
      case "close":
        this.dispose();
        break;
    }
  }

  private async initialise(msg: any) {
    try {
      this.channels = msg.channels;
      if (typeof msg.options === "number") this.options = msg.options;
      // A compiled WebAssembly.Module cannot be reliably structured-cloned into
      // an AudioWorkletGlobalScope, so the wasm is passed as bytes and compiled
      // here. (A pre-compiled Module is also accepted, e.g. for non-worklet use.)
      const w = msg.wasm;
      const mod = w instanceof WebAssembly.Module ? w : await WebAssembly.compile(w);
      this.rb = await RubberBandInterface.initialize(mod);
      this.allocate();
      this.createState();
      this.port.postMessage({ type: "ready" });
    } catch (e) {
      this.port.postMessage({ type: "error", error: String((e && (e as Error).message) || e) });
    }
  }

  private allocate() {
    const rb = this.rb!;
    this.inPtr = rb.malloc(this.channels * 4);
    this.outPtr = rb.malloc(this.channels * 4);
    this.inChan = [];
    this.outChan = [];
    this.ring = [];
    for (let ch = 0; ch < this.channels; ch++) {
      const ip = rb.malloc(MAX_BLOCK * 4);
      const op = rb.malloc(MAX_BLOCK * 4);
      this.inChan.push(ip);
      this.outChan.push(op);
      rb.memWritePtr(this.inPtr + ch * 4, ip);
      rb.memWritePtr(this.outPtr + ch * 4, op);
      this.ring.push(new Float32Array(RING_CAPACITY));
    }
  }

  private createState() {
    const rb = this.rb!;
    if (this.state) {
      rb.rubberband_delete(this.state);
      this.state = 0;
    }
    // Construct at the *context* sample rate (the worklet global `sampleRate`),
    // not the source rate, so output frames map 1:1 onto render frames.
    this.state = rb.rubberband_new(sampleRate, this.channels, this.options, 1, 1);
    rb.rubberband_set_max_process_size(this.state, MAX_BLOCK);
    this.applyRatios();
  }

  private applyRatios() {
    if (!this.rb || !this.state) return;
    // Fold any source/context sample-rate difference into the ratios so RB does
    // the resampling for us: feeding source-rate frames to a context-rate
    // stretcher shifts pitch by rateFactor and speed by rateFactor, which we
    // counteract here.
    const timeRatio = this.rateFactor / this.speed;
    const pitch = this.pitchScale / this.rateFactor;
    this.rb.rubberband_set_time_ratio(this.state, timeRatio);
    this.rb.rubberband_set_pitch_scale(this.state, pitch);
  }

  private setBuffer(msg: any) {
    this.source = msg.channels || [];
    this.sourceLen = this.source[0] ? this.source[0].length : 0;
    this.sourceSampleRate = msg.sampleRate || sampleRate;
    this.rateFactor = sampleRate / this.sourceSampleRate;
    this.playing = false;
    this.resetTransport(0);
  }

  /** Reset transport + stretcher to a clean start at `startFrame`. */
  private resetTransport(startFrame: number) {
    this.readPos = startFrame;
    this.ringRead = 0;
    this.ringWrite = 0;
    this.ringCount = 0;
    this.finished = false;
    this.sentFinal = false;
    this.endedPosted = false;
    const rb = this.rb;
    const st = this.state;
    if (rb && st) {
      rb.rubberband_reset(st);
      // Ratios must be current before querying start pad / delay.
      this.applyRatios();
      this.startPad = rb.rubberband_get_preferred_start_pad(st);
      this.toDrop = rb.rubberband_get_start_delay(st);
    }
  }

  /** Fill the output ring off the render-deadline (called from message handler). */
  private preroll() {
    this.pump(BUFFER_TARGET, 1 << 20);
  }

  /**
   * Drive the stretcher until the output ring holds `target` frames (or the
   * stream ends / the budget is exhausted).
   */
  private pump(target: number, budget: number) {
    const rb = this.rb;
    const st = this.state;
    if (!rb || !st || this.finished) return;

    while (this.ringCount < target && !this.finished && budget-- > 0) {
      const avail = rb.rubberband_available(st);
      if (avail < 0) {
        // -1: all input processed and all output read => fully finished.
        this.finished = true;
        break;
      }
      if (avail > 0) {
        this.drain(avail);
        continue;
      }
      // avail === 0: RB needs more input to make progress.
      if (this.sentFinal) break; // already flushed; nothing more will come.
      let req = rb.rubberband_get_samples_required(st);
      if (req <= 0) req = 1; // ensure forward progress
      if (req > MAX_BLOCK) req = MAX_BLOCK;
      const isFinal = this.assembleInput(req);
      rb.rubberband_process(st, this.inPtr, req, isFinal ? 1 : 0);
      if (isFinal) this.sentFinal = true;
    }
  }

  /** Assemble `req` input frames into the wasm scratch; returns whether `final`. */
  private assembleInput(req: number): boolean {
    const rb = this.rb!;
    const channels = this.channels;
    const dst: Float32Array[] = [];
    for (let ch = 0; ch < channels; ch++) dst.push(rb.memReadF32(this.inChan[ch], req));

    let final = false;
    for (let i = 0; i < req; i++) {
      if (this.startPad > 0) {
        for (let ch = 0; ch < channels; ch++) dst[ch][i] = 0;
        this.startPad--;
        continue;
      }
      if (this.readPos >= this.sourceLen) {
        if (this.loop && this.sourceLen > 0) {
          // Wrap within the same block so no frames are withheld at the seam.
          this.readPos = 0;
        } else {
          for (let ch = 0; ch < channels; ch++) dst[ch][i] = 0;
          final = true; // source exhausted, not looping: last block.
          continue;
        }
      }
      const p = this.readPos;
      for (let ch = 0; ch < channels; ch++) {
        const src = this.source[ch];
        dst[ch][i] = src ? src[p] : 0;
      }
      this.readPos++;
    }
    return final;
  }

  /** Retrieve up to `avail` frames from RB into the ring, applying start-delay trim. */
  private drain(avail: number) {
    const rb = this.rb!;
    const st = this.state;
    let remaining = avail;
    while (remaining > 0) {
      const free = RING_CAPACITY - this.ringCount;
      if (free <= 0) break;
      const want = Math.min(remaining, MAX_BLOCK, free);
      const got = rb.rubberband_retrieve(st, this.outPtr, want);
      if (got <= 0) break;

      // Trim the start delay by FRAME (once per retrieve), not per channel.
      let start = 0;
      if (this.toDrop > 0) {
        const d = Math.min(this.toDrop, got);
        this.toDrop -= d;
        start = d;
      }
      const keep = got - start;
      if (keep > 0) {
        const views: Float32Array[] = [];
        for (let ch = 0; ch < this.channels; ch++) views.push(rb.memReadF32(this.outChan[ch], got));
        this.push(views, start, keep);
      }
      remaining -= got;
    }
  }

  /** Push `keep` frames (from offset `start`) of each channel view into the ring. */
  private push(views: Float32Array[], start: number, keep: number) {
    const cap = RING_CAPACITY;
    const w = this.ringWrite;
    const first = Math.min(keep, cap - w);
    const second = keep - first;
    for (let ch = 0; ch < this.channels; ch++) {
      const src = views[ch];
      this.ring[ch].set(src.subarray(start, start + first), w);
      if (second > 0) this.ring[ch].set(src.subarray(start + first, start + keep), 0);
    }
    this.ringWrite = (w + keep) % cap;
    this.ringCount += keep;
  }

  /** Pop `n` frames from the ring into the output channel arrays. */
  private pop(out: Float32Array[], n: number) {
    const cap = RING_CAPACITY;
    const r = this.ringRead;
    const first = Math.min(n, cap - r);
    const second = n - first;
    for (let ch = 0; ch < this.channels; ch++) {
      const dst = out[ch];
      if (!dst) continue;
      dst.set(this.ring[ch].subarray(r, r + first), 0);
      if (second > 0) dst.set(this.ring[ch].subarray(0, second), first);
    }
    this.ringRead = (r + n) % cap;
    this.ringCount -= n;
  }

  private dispose() {
    this.closed = true;
    const rb = this.rb;
    if (rb) {
      if (this.state) rb.rubberband_delete(this.state);
      for (const p of this.inChan) rb.free(p);
      for (const p of this.outChan) rb.free(p);
      if (this.inPtr) rb.free(this.inPtr);
      if (this.outPtr) rb.free(this.outPtr);
    }
    this.state = 0;
    this.rb = null;
    this.port.onmessage = null;
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    if (this.closed) return false; // release the processor
    const out = outputs[0];
    if (!out || out.length === 0) return true;
    const n = out[0].length;

    if (!this.rb || !this.state || !this.playing) {
      for (let ch = 0; ch < out.length; ch++) out[ch].fill(0);
      return true;
    }

    // Top up the ring with a bounded amount of work (steady-state warm-up was
    // already done off-deadline in preroll()).
    this.pump(BUFFER_TARGET, PUMP_BUDGET);

    const give = Math.min(n, this.ringCount);
    if (give > 0) this.pop(out, give);
    for (let ch = 0; ch < out.length; ch++) {
      if (ch >= this.channels) {
        out[ch].fill(0);
      } else if (give < n) {
        out[ch].fill(0, give); // underrun / end: pad with silence
      }
    }

    if (this.finished && this.ringCount === 0 && !this.endedPosted) {
      this.endedPosted = true;
      this.playing = false;
      this.port.postMessage({ type: "ended" });
    }

    this.framesSinceReport += n;
    if (this.framesSinceReport >= sampleRate / 30) {
      this.framesSinceReport = 0;
      this.port.postMessage({ type: "position", seconds: this.readPos / this.sourceSampleRate });
    }
    return true;
  }
}

registerProcessor("rubberband-processor", RubberBandProcessor);
