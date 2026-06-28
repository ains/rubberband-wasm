// Minimal ambient declarations for the AudioWorklet global scope.
//
// As of the TypeScript version pinned by this project, `lib.dom.d.ts` does not
// include the AudioWorkletGlobalScope globals (`AudioWorkletProcessor`,
// `registerProcessor`, `sampleRate`, ...). They are declared here so that
// `src/RubberBandProcessor.ts` type-checks under both `tsc` and
// `@rollup/plugin-typescript`. These declarations only describe the subset the
// processor actually uses.

interface AudioWorkletProcessor {
  readonly port: MessagePort;
}

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: any): AudioWorkletProcessor;
};

declare function registerProcessor(
  name: string,
  processorCtor: new (options?: any) => AudioWorkletProcessor
): void;

// The render-quantum sample rate of the enclosing AudioContext.
declare var sampleRate: number;
// The sample frame / time of the current render quantum (unused but part of the scope).
declare var currentFrame: number;
declare var currentTime: number;
