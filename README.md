# rubberband-wasm

WebAssembly build of the audio time-stretching and pitch-shifting [Rubber Band Library](https://breakfastquay.com/rubberband/)

# Usage

See [demo app](https://daninet.github.io/rubberband-wasm/).

## Real-time API (Web Audio)

`RubberBandNode` is an `AudioWorklet` source node that time-stretches **and**
pitch-shifts a buffer in real time, with both controllable live while it plays.
Because real-time time-stretching requires controlling the source read-rate, the
node owns the audio (like an `AudioBufferSourceNode`) rather than being a
pass-through effect.

```js
import { RubberBandNode } from "rubberband-wasm";

const ctx = new AudioContext();

const node = await RubberBandNode.create(ctx, {
  // The standalone worklet bundle and the wasm, served by your app:
  processorUrl: "rubberband-processor.js", // dist/rubberband-processor.js
  wasmUrl: "rubberband.wasm",              // dist/rubberband.wasm
  channelCount: audioBuffer.numberOfChannels,
});

node.connect(ctx.destination);
node.setBuffer(audioBuffer);      // an AudioBuffer or Float32Array[] (copied, not consumed)

node.setTempo(1.5);               // 1.5x speed, pitch unchanged
node.setPitchSemitones(-3);       // down 3 semitones, tempo unchanged
node.loop = true;
node.play();                      // play() / pause() / stop() / seek(seconds)

node.onended = () => console.log("done");
```

Both `dist/rubberband-processor.js` and `dist/rubberband.wasm` must be reachable
over http(s) at the URLs you pass (AudioWorklet cannot load from `file://`). See
[`demo/realtime.html`](demo/realtime.html) for a complete example.

# License

Rubber Band Library is open source software under the GNU General Public License. If you want to distribute it in a proprietary commercial application, you need to buy a licence. [Read more about this.](https://breakfastquay.com/rubberband/license.html)
