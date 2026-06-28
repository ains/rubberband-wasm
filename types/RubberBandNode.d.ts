export interface RubberBandNodeOptions {
    /** URL of the bundled worklet processor (dist/rubberband-processor.js). */
    processorUrl?: string;
    /** URL to fetch the rubberband.wasm binary from. */
    wasmUrl?: string;
    /** Pre-fetched wasm binary (compiled inside the worklet). */
    wasmBinary?: ArrayBuffer | Uint8Array;
    /**
     * Number of output channels (default 2). A source with fewer channels is
     * duplicated up to this count; a source with more has its extra channels
     * dropped (the first `channelCount` are kept).
     */
    channelCount?: number;
    /** RubberBand options bitmask (advanced; defaults to a real-time, glitch-free preset). */
    options?: number;
}
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
export declare class RubberBandNode extends AudioWorkletNode {
    private readonly _channels;
    private readonly _sourceSampleRate;
    private _ready;
    private _readyResolve;
    private _readyReject;
    /** Fired once when playback reaches the end (re-armed on every play/seek/stop). */
    onended: (() => void) | null;
    /** Fired periodically with the current playback position, in seconds of source time. */
    onposition: ((seconds: number) => void) | null;
    private constructor();
    /** Number of output channels the node was created with. */
    get sourceChannels(): number;
    /** Resolves once the worklet has compiled the wasm and is ready to play. */
    get ready(): Promise<void>;
    /** Register the worklet module on a context (idempotent per context). */
    static addModule(context: BaseAudioContext, processorUrl: string): Promise<void>;
    /** Create a ready-to-use RubberBandNode. */
    static create(context: BaseAudioContext, opts?: RubberBandNodeOptions): Promise<RubberBandNode>;
    /**
     * Load source audio. Channel data is copied before transfer, so the supplied
     * AudioBuffer/arrays are left intact. Resets the transport to the start.
     */
    setBuffer(buffer: AudioBuffer | Float32Array[]): void;
    private _normalizeChannels;
    /** Start (or restart, if previously ended) playback. */
    play(): void;
    /** Pause, keeping the current position. */
    pause(): void;
    /** Stop and rewind to the start. */
    stop(): void;
    /** Seek to a position in seconds of source time. */
    seek(seconds: number): void;
    /** Enable/disable looping. */
    set loop(value: boolean);
    /** Set playback speed (1 = normal, 2 = double speed) without changing pitch. */
    setTempo(speed: number): void;
    /** Set the time ratio directly (output duration / input duration). */
    setTimeRatio(ratio: number): void;
    /** Set the pitch scale directly (1 = no shift, 2 = up one octave). */
    setPitchScale(scale: number): void;
    /** Set the pitch shift in semitones (without changing tempo). */
    setPitchSemitones(semitones: number): void;
    /** Free wasm resources in the worklet and disconnect the node. */
    close(): void;
}
/** Default RubberBand options used by the real-time node (exported for reference/override). */
export declare const RUBBERBAND_REALTIME_DEFAULT_OPTIONS: number;
