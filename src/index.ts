// Core low-level interface, enums and types (also usable directly inside an
// AudioWorklet — no DOM dependency).
export * from "./RubberBandInterface";

// Real-time AudioWorklet node (main-thread). Kept in a separate module so it is
// never pulled into the worklet processor bundle (it extends AudioWorkletNode,
// which does not exist in the AudioWorkletGlobalScope).
export { RubberBandNode, RUBBERBAND_REALTIME_DEFAULT_OPTIONS } from "./RubberBandNode";
export type { RubberBandNodeOptions } from "./RubberBandNode";
