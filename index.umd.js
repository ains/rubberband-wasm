/*!
 * rubberband-wasm v4.0.1 (https://www.npmjs.com/package/rubberband-wasm)
 * (c) Dani Biro
 * @license GPLv2
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.rubberband = {}));
})(this, (function (exports) { 'use strict';

    exports.RubberBandOption = void 0;
    (function (RubberBandOption) {
        RubberBandOption[RubberBandOption["RubberBandOptionProcessOffline"] = 0] = "RubberBandOptionProcessOffline";
        RubberBandOption[RubberBandOption["RubberBandOptionProcessRealTime"] = 1] = "RubberBandOptionProcessRealTime";
        RubberBandOption[RubberBandOption["RubberBandOptionStretchElastic"] = 0] = "RubberBandOptionStretchElastic";
        RubberBandOption[RubberBandOption["RubberBandOptionStretchPrecise"] = 16] = "RubberBandOptionStretchPrecise";
        RubberBandOption[RubberBandOption["RubberBandOptionTransientsCrisp"] = 0] = "RubberBandOptionTransientsCrisp";
        RubberBandOption[RubberBandOption["RubberBandOptionTransientsMixed"] = 256] = "RubberBandOptionTransientsMixed";
        RubberBandOption[RubberBandOption["RubberBandOptionTransientsSmooth"] = 512] = "RubberBandOptionTransientsSmooth";
        RubberBandOption[RubberBandOption["RubberBandOptionDetectorCompound"] = 0] = "RubberBandOptionDetectorCompound";
        RubberBandOption[RubberBandOption["RubberBandOptionDetectorPercussive"] = 1024] = "RubberBandOptionDetectorPercussive";
        RubberBandOption[RubberBandOption["RubberBandOptionDetectorSoft"] = 2048] = "RubberBandOptionDetectorSoft";
        RubberBandOption[RubberBandOption["RubberBandOptionPhaseLaminar"] = 0] = "RubberBandOptionPhaseLaminar";
        RubberBandOption[RubberBandOption["RubberBandOptionPhaseIndependent"] = 8192] = "RubberBandOptionPhaseIndependent";
        RubberBandOption[RubberBandOption["RubberBandOptionThreadingAuto"] = 0] = "RubberBandOptionThreadingAuto";
        RubberBandOption[RubberBandOption["RubberBandOptionThreadingNever"] = 65536] = "RubberBandOptionThreadingNever";
        RubberBandOption[RubberBandOption["RubberBandOptionThreadingAlways"] = 131072] = "RubberBandOptionThreadingAlways";
        RubberBandOption[RubberBandOption["RubberBandOptionWindowStandard"] = 0] = "RubberBandOptionWindowStandard";
        RubberBandOption[RubberBandOption["RubberBandOptionWindowShort"] = 1048576] = "RubberBandOptionWindowShort";
        RubberBandOption[RubberBandOption["RubberBandOptionWindowLong"] = 2097152] = "RubberBandOptionWindowLong";
        RubberBandOption[RubberBandOption["RubberBandOptionSmoothingOff"] = 0] = "RubberBandOptionSmoothingOff";
        RubberBandOption[RubberBandOption["RubberBandOptionSmoothingOn"] = 8388608] = "RubberBandOptionSmoothingOn";
        RubberBandOption[RubberBandOption["RubberBandOptionFormantShifted"] = 0] = "RubberBandOptionFormantShifted";
        RubberBandOption[RubberBandOption["RubberBandOptionFormantPreserved"] = 16777216] = "RubberBandOptionFormantPreserved";
        RubberBandOption[RubberBandOption["RubberBandOptionPitchHighSpeed"] = 0] = "RubberBandOptionPitchHighSpeed";
        RubberBandOption[RubberBandOption["RubberBandOptionPitchHighQuality"] = 33554432] = "RubberBandOptionPitchHighQuality";
        RubberBandOption[RubberBandOption["RubberBandOptionPitchHighConsistency"] = 67108864] = "RubberBandOptionPitchHighConsistency";
        RubberBandOption[RubberBandOption["RubberBandOptionChannelsApart"] = 0] = "RubberBandOptionChannelsApart";
        RubberBandOption[RubberBandOption["RubberBandOptionChannelsTogether"] = 268435456] = "RubberBandOptionChannelsTogether";
        RubberBandOption[RubberBandOption["RubberBandOptionEngineFaster"] = 0] = "RubberBandOptionEngineFaster";
        RubberBandOption[RubberBandOption["RubberBandOptionEngineFiner"] = 536870912] = "RubberBandOptionEngineFiner";
    })(exports.RubberBandOption || (exports.RubberBandOption = {}));
    exports.RubberBandPresetOption = void 0;
    (function (RubberBandPresetOption) {
        RubberBandPresetOption[RubberBandPresetOption["DefaultOptions"] = 0] = "DefaultOptions";
        RubberBandPresetOption[RubberBandPresetOption["PercussiveOptions"] = 1056768] = "PercussiveOptions";
    })(exports.RubberBandPresetOption || (exports.RubberBandPresetOption = {}));
    exports.RubberBandLiveOption = void 0;
    (function (RubberBandLiveOption) {
        RubberBandLiveOption[RubberBandLiveOption["RubberBandLiveOptionWindowShort"] = 0] = "RubberBandLiveOptionWindowShort";
        RubberBandLiveOption[RubberBandLiveOption["RubberBandLiveOptionWindowMedium"] = 1048576] = "RubberBandLiveOptionWindowMedium";
        RubberBandLiveOption[RubberBandLiveOption["RubberBandLiveOptionFormantShifted"] = 0] = "RubberBandLiveOptionFormantShifted";
        RubberBandLiveOption[RubberBandLiveOption["RubberBandLiveOptionFormantPreserved"] = 16777216] = "RubberBandLiveOptionFormantPreserved";
        RubberBandLiveOption[RubberBandLiveOption["RubberBandLiveOptionChannelsApart"] = 0] = "RubberBandLiveOptionChannelsApart";
        RubberBandLiveOption[RubberBandLiveOption["RubberBandLiveOptionChannelsTogether"] = 268435456] = "RubberBandLiveOptionChannelsTogether";
    })(exports.RubberBandLiveOption || (exports.RubberBandLiveOption = {}));
    class RubberBandInterface {
        constructor() { }
        static async initialize(module) {
            if (typeof WebAssembly === "undefined") {
                throw new Error("WebAssembly is not supported in this environment!");
            }
            let heap = {};
            const errorHandler = (...params) => {
                console.error("WASI called with params", params);
                return 52;
            };
            let printBuffer = [];
            const wasmInstance = await WebAssembly.instantiate(module, {
                env: {
                    emscripten_notify_memory_growth: () => {
                        heap.HEAP8 = new Uint8Array(wasmInstance.exports.memory.buffer);
                        heap.HEAP32 = new Uint32Array(wasmInstance.exports.memory.buffer);
                    },
                },
                wasi_snapshot_preview1: {
                    proc_exit: (...params) => errorHandler("proc_exit", params),
                    fd_read: (...params) => errorHandler("fd_read", params),
                    fd_write: (fd, iov, iovcnt, pnum) => {
                        if (fd > 2)
                            return 52;
                        let num = 0;
                        for (let i = 0; i < iovcnt; i++) {
                            const ptr = heap.HEAP32[iov >> 2];
                            const len = heap.HEAP32[(iov + 4) >> 2];
                            iov += 8;
                            for (let j = 0; j < len; j++) {
                                const curr = heap.HEAP8[ptr + j];
                                if (curr === 0 || curr === 10) {
                                    console.log(printBuffer.join(""));
                                    printBuffer.length = 0;
                                }
                                else {
                                    printBuffer.push(String.fromCharCode(curr));
                                }
                            }
                            num += len;
                        }
                        heap.HEAP32[pnum >> 2] = num;
                        return 0;
                    },
                    fd_seek: (...params) => errorHandler("fd_seek", params),
                    fd_close: (...params) => errorHandler("fd_close", params),
                    environ_sizes_get: (penviron_count, penviron_buf_size) => {
                        // heap.HEAP32[penviron_count >> 2] = 0;
                        // heap.HEAP32[penviron_buf_size >> 2] = 0;
                        return 52; // NO_SYS
                    },
                    environ_get: (...params) => errorHandler("environ_get", params),
                    clock_time_get: (...params) => errorHandler("clock_time_get", params),
                },
            });
            const exports = wasmInstance.exports;
            heap.HEAP8 = new Uint8Array(wasmInstance.exports.memory.buffer);
            heap.HEAP32 = new Uint32Array(wasmInstance.exports.memory.buffer);
            exports._initialize();
            const instance = { heap, exports };
            const ret = new RubberBandInterface();
            ret.wasm = instance;
            return ret;
        }
        malloc(size) {
            return this.wasm.exports.wasm_malloc(size);
        }
        memWrite(destPtr, data) {
            const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
            this.wasm.heap.HEAP8.set(uint8Array, destPtr);
        }
        memWritePtr(destPtr, srcPtr) {
            const buf = new Uint8Array(4);
            const view = new DataView(buf.buffer);
            view.setUint32(0, srcPtr, true);
            this.wasm.heap.HEAP8.set(buf, destPtr);
        }
        memReadU8(srcPtr, length) {
            return this.wasm.heap.HEAP8.subarray(srcPtr, srcPtr + length);
        }
        memReadF32(srcPtr, length) {
            const res = this.memReadU8(srcPtr, length * 4);
            return new Float32Array(res.buffer, res.byteOffset, length);
        }
        free(ptr) {
            this.wasm.exports.wasm_free(ptr);
        }
        rubberband_new(sampleRate, channels, options, initialTimeRatio, initialPitchScale) {
            return this.wasm.exports.rb_new(sampleRate, channels, options, initialTimeRatio, initialPitchScale);
        }
        rubberband_delete(state) {
            this.wasm.exports.rb_delete(state);
        }
        rubberband_reset(state) {
            this.wasm.exports.rb_reset(state);
        }
        rubberband_get_engine_version(state) {
            return this.wasm.exports.rb_get_engine_version(state);
        }
        rubberband_set_time_ratio(state, ratio) {
            this.wasm.exports.rb_set_time_ratio(state, ratio);
        }
        rubberband_set_pitch_scale(state, scale) {
            this.wasm.exports.rb_set_pitch_scale(state, scale);
        }
        rubberband_set_formant_scale(state, scale) {
            this.wasm.exports.rb_set_formant_scale(state, scale);
        }
        rubberband_get_time_ratio(state) {
            return this.wasm.exports.rb_get_time_ratio(state);
        }
        rubberband_get_pitch_scale(state) {
            return this.wasm.exports.rb_get_pitch_scale(state);
        }
        rubberband_get_formant_scale(state) {
            return this.wasm.exports.rb_get_formant_scale(state);
        }
        rubberband_get_preferred_start_pad(state) {
            return this.wasm.exports.rb_get_preferred_start_pad(state);
        }
        rubberband_get_start_delay(state) {
            return this.wasm.exports.rb_get_start_delay(state);
        }
        rubberband_get_latency(state) {
            return this.wasm.exports.rb_get_latency(state);
        }
        rubberband_set_transients_option(state, options) {
            this.wasm.exports.rb_set_transients_option(state, options);
        }
        rubberband_set_detector_option(state, options) {
            this.wasm.exports.rb_set_detector_option(state, options);
        }
        rubberband_set_phase_option(state, options) {
            this.wasm.exports.rb_set_phase_option(state, options);
        }
        rubberband_set_formant_option(state, options) {
            this.wasm.exports.rb_set_formant_option(state, options);
        }
        rubberband_set_pitch_option(state, options) {
            this.wasm.exports.rb_set_pitch_option(state, options);
        }
        rubberband_set_expected_input_duration(state, samples) {
            this.wasm.exports.rb_set_expected_input_duration(state, samples);
        }
        rubberband_get_samples_required(state) {
            return this.wasm.exports.rb_get_samples_required(state);
        }
        rubberband_set_max_process_size(state, samples) {
            this.wasm.exports.rb_set_max_process_size(state, samples);
        }
        rubberband_get_process_size_limit(state) {
            return this.wasm.exports.rb_get_process_size_limit(state);
        }
        rubberband_set_key_frame_map(state, keyframecount, from, to) {
            this.wasm.exports.rb_set_key_frame_map(state, keyframecount, from, to);
        }
        rubberband_study(state, input, samples, final) {
            this.wasm.exports.rb_study(state, input, samples, final);
        }
        rubberband_process(state, input, samples, final) {
            this.wasm.exports.rb_process(state, input, samples, final);
        }
        rubberband_available(state) {
            return this.wasm.exports.rb_available(state);
        }
        rubberband_retrieve(state, output, samples) {
            return this.wasm.exports.rb_retrieve(state, output, samples);
        }
        rubberband_get_channel_count(state) {
            return this.wasm.exports.rb_get_channel_count(state);
        }
        rubberband_calculate_stretch(state) {
            this.wasm.exports.rb_calculate_stretch(state);
        }
        rubberband_set_debug_level(state, level) {
            this.wasm.exports.rb_set_debug_level(state, level);
        }
        rubberband_set_default_debug_level(level) {
            this.wasm.exports.rb_set_default_debug_level(level);
        }
        // RubberBandLiveShifter — real-time pitch shifter introduced in Rubber Band 4.0.
        rubberband_live_new(sampleRate, channels, options) {
            return this.wasm.exports.rb_live_new(sampleRate, channels, options);
        }
        rubberband_live_delete(state) {
            this.wasm.exports.rb_live_delete(state);
        }
        rubberband_live_reset(state) {
            this.wasm.exports.rb_live_reset(state);
        }
        rubberband_live_set_pitch_scale(state, scale) {
            this.wasm.exports.rb_live_set_pitch_scale(state, scale);
        }
        rubberband_live_get_pitch_scale(state) {
            return this.wasm.exports.rb_live_get_pitch_scale(state);
        }
        rubberband_live_set_formant_scale(state, scale) {
            this.wasm.exports.rb_live_set_formant_scale(state, scale);
        }
        rubberband_live_get_formant_scale(state) {
            return this.wasm.exports.rb_live_get_formant_scale(state);
        }
        rubberband_live_get_start_delay(state) {
            return this.wasm.exports.rb_live_get_start_delay(state);
        }
        rubberband_live_set_formant_option(state, options) {
            this.wasm.exports.rb_live_set_formant_option(state, options);
        }
        rubberband_live_get_block_size(state) {
            return this.wasm.exports.rb_live_get_block_size(state);
        }
        rubberband_live_shift(state, input, output) {
            this.wasm.exports.rb_live_shift(state, input, output);
        }
        rubberband_live_get_channel_count(state) {
            return this.wasm.exports.rb_live_get_channel_count(state);
        }
        rubberband_live_set_debug_level(state, level) {
            this.wasm.exports.rb_live_set_debug_level(state, level);
        }
        rubberband_live_set_default_debug_level(level) {
            this.wasm.exports.rb_live_set_default_debug_level(level);
        }
    }

    // Tracks which contexts have already had the worklet module registered.
    const moduleAdded = new WeakSet();
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
    class RubberBandNode extends AudioWorkletNode {
        constructor(context, channels) {
            super(context, "rubberband-processor", {
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [channels],
            });
            /** Fired once when playback reaches the end (re-armed on every play/seek/stop). */
            this.onended = null;
            /** Fired periodically with the current playback position, in seconds of source time. */
            this.onposition = null;
            this._channels = channels;
            this._sourceSampleRate = context.sampleRate;
            this._ready = new Promise((resolve, reject) => {
                this._readyResolve = resolve;
                this._readyReject = reject;
            });
            this.port.onmessage = (e) => {
                const d = e.data;
                if (!d)
                    return;
                if (d.type === "ready")
                    this._readyResolve();
                else if (d.type === "error")
                    this._readyReject(new Error("RubberBand worklet init failed: " + d.error));
                else if (d.type === "ended")
                    this.onended && this.onended();
                else if (d.type === "position")
                    this.onposition && this.onposition(d.seconds);
            };
        }
        /** Number of output channels the node was created with. */
        get sourceChannels() {
            return this._channels;
        }
        /** Resolves once the worklet has compiled the wasm and is ready to play. */
        get ready() {
            return this._ready;
        }
        /** Register the worklet module on a context (idempotent per context). */
        static async addModule(context, processorUrl) {
            if (!moduleAdded.has(context)) {
                await context.audioWorklet.addModule(processorUrl);
                moduleAdded.add(context);
            }
        }
        /** Create a ready-to-use RubberBandNode. */
        static async create(context, opts = {}) {
            if (typeof AudioWorkletNode === "undefined" || !context.audioWorklet) {
                throw new Error("AudioWorklet is not supported in this AudioContext.");
            }
            const processorUrl = opts.processorUrl || "rubberband-processor.js";
            await RubberBandNode.addModule(context, processorUrl);
            // The worklet compiles the wasm itself: a compiled WebAssembly.Module cannot
            // be reliably structured-cloned into an AudioWorkletGlobalScope, but bytes can.
            let bytes;
            if (opts.wasmBinary) {
                const b = opts.wasmBinary;
                bytes = b instanceof Uint8Array ? b.slice().buffer : b.slice(0);
            }
            else if (opts.wasmUrl) {
                bytes = await (await fetch(opts.wasmUrl)).arrayBuffer();
            }
            else {
                throw new Error("RubberBandNode.create requires one of: wasmBinary, wasmUrl.");
            }
            const channels = opts.channelCount && opts.channelCount > 0 ? opts.channelCount : 2;
            const node = new RubberBandNode(context, channels);
            node.port.postMessage({ type: "initialise", wasm: bytes, channels, options: opts.options }, [bytes]);
            try {
                await node._ready;
            }
            catch (e) {
                node.close(); // tear down the worklet + free any wasm it allocated
                throw e;
            }
            return node;
        }
        /**
         * Load source audio. Channel data is copied before transfer, so the supplied
         * AudioBuffer/arrays are left intact. Resets the transport to the start.
         */
        setBuffer(buffer) {
            let chans;
            let rate;
            if (Array.isArray(buffer)) {
                chans = buffer.map((c) => new Float32Array(c));
                rate = this._sourceSampleRate;
            }
            else {
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
        // Coerce to exactly this._channels with distinct backing buffers (so every
        // entry in the transfer list is unique): a source with fewer channels is
        // duplicated, a source with more has its extra channels dropped.
        _normalizeChannels(chans) {
            const n = this._channels;
            if (chans.length === n)
                return chans;
            const out = [];
            for (let ch = 0; ch < n; ch++) {
                const src = chans[ch < chans.length ? ch : chans.length - 1] || new Float32Array(0);
                out.push(ch < chans.length ? src : new Float32Array(src));
            }
            return out;
        }
        /** Start (or restart, if previously ended) playback. */
        play() {
            this.port.postMessage({ type: "play" });
        }
        /** Pause, keeping the current position. */
        pause() {
            this.port.postMessage({ type: "pause" });
        }
        /** Stop and rewind to the start. */
        stop() {
            this.port.postMessage({ type: "stop" });
        }
        /** Seek to a position in seconds of source time. */
        seek(seconds) {
            this.port.postMessage({ type: "seek", seconds });
        }
        /** Enable/disable looping. */
        set loop(value) {
            this.port.postMessage({ type: "loop", value });
        }
        /** Set playback speed (1 = normal, 2 = double speed) without changing pitch. */
        setTempo(speed) {
            this.port.postMessage({ type: "speed", value: speed });
        }
        /** Set the time ratio directly (output duration / input duration). */
        setTimeRatio(ratio) {
            this.port.postMessage({ type: "speed", value: ratio > 0 ? 1 / ratio : 1 });
        }
        /** Set the pitch scale directly (1 = no shift, 2 = up one octave). */
        setPitchScale(scale) {
            this.port.postMessage({ type: "pitch", value: scale });
        }
        /** Set the pitch shift in semitones (without changing tempo). */
        setPitchSemitones(semitones) {
            this.port.postMessage({ type: "pitch", value: Math.pow(2, semitones / 12) });
        }
        /** Free wasm resources in the worklet and disconnect the node. */
        close() {
            this.port.postMessage({ type: "close" });
            this.disconnect();
            this.port.onmessage = null;
        }
    }
    /** Default RubberBand options used by the real-time node (exported for reference/override). */
    const RUBBERBAND_REALTIME_DEFAULT_OPTIONS = exports.RubberBandOption.RubberBandOptionProcessRealTime |
        exports.RubberBandOption.RubberBandOptionEngineFaster |
        exports.RubberBandOption.RubberBandOptionPitchHighConsistency;

    exports.RUBBERBAND_REALTIME_DEFAULT_OPTIONS = RUBBERBAND_REALTIME_DEFAULT_OPTIONS;
    exports.RubberBandInterface = RubberBandInterface;
    exports.RubberBandNode = RubberBandNode;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
