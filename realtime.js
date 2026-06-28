// Real-time time-stretch + pitch-shift demo using RubberBandNode (AudioWorklet).
//
// The worklet processor (rubberband-processor.js) and the wasm (rubberband.wasm)
// are served next to this file. RubberBandNode.create() registers the worklet,
// compiles the wasm on the main thread, and hands the compiled module to the
// processor.

const { RubberBandNode } = rubberband;

let audioCtx = null;
let node = null;
let buffer = null;

const $ = (id) => document.getElementById(id);
const setStatus = (msg) => ($("status").innerText = msg);
const enable = (ids, on) => ids.forEach((id) => ($(id).disabled = !on));

const currentSemitones = () => Number($("pitch").value);
const currentSpeed = () => Number($("tempo").value);

async function ensureContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") await audioCtx.resume();
  return audioCtx;
}

// (Re)create the node for a given channel count (output channel count is fixed
// at construction, so a new file with a different channel count needs a new node).
async function ensureNode(channels) {
  await ensureContext();
  if (node && node.sourceChannels !== channels) {
    node.close();
    node = null;
  }
  if (!node) {
    setStatus("Loading worklet + wasm…");
    node = await RubberBandNode.create(audioCtx, {
      processorUrl: "./rubberband-processor.js",
      wasmUrl: "./rubberband.wasm",
      channelCount: channels,
    });
    node.connect(audioCtx.destination);
    node.onended = () => {
      setStatus("Ended.");
      enable(["pause", "stop"], false);
      enable(["play"], true);
    };
  }
  return node;
}

$("file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  enable(["play", "pause", "stop"], false);
  setStatus("Decoding…");
  try {
    await ensureContext();
    const arrayBuffer = await file.arrayBuffer();
    buffer = await audioCtx.decodeAudioData(arrayBuffer);
    await ensureNode(buffer.numberOfChannels);
    loadBufferIntoNode();
    enable(["play"], true);
    setStatus(`Ready: ${buffer.duration.toFixed(1)}s, ${buffer.numberOfChannels}ch @ ${buffer.sampleRate}Hz. Press Play.`);
  } catch (err) {
    console.error(err);
    setStatus("Error: " + err.message);
  }
});

function loadBufferIntoNode() {
  node.setBuffer(buffer);
  // apply current control values to the fresh transport
  node.setPitchSemitones(currentSemitones());
  node.setTempo(currentSpeed());
  node.loop = $("loop").checked;
}

$("play").addEventListener("click", async () => {
  if (!node) return;
  await ensureContext();
  node.play();
  enable(["pause", "stop"], true);
  enable(["play"], false);
  setStatus("Playing… (drag the sliders while it plays)");
});

$("pause").addEventListener("click", () => {
  if (!node) return;
  node.pause();
  enable(["play"], true);
  enable(["pause"], false);
  setStatus("Paused.");
});

$("stop").addEventListener("click", () => {
  if (!node) return;
  node.stop();
  enable(["play"], true);
  enable(["pause", "stop"], false);
  setStatus("Stopped.");
});

// Live controls — these update the running stretcher with no glitch/restart.
$("pitch").addEventListener("input", () => {
  $("pitchLabel").innerText = `${currentSemitones()} st`;
  if (node) node.setPitchSemitones(currentSemitones());
});

$("tempo").addEventListener("input", () => {
  $("tempoLabel").innerText = `${Math.round(currentSpeed() * 100)}%`;
  if (node) node.setTempo(currentSpeed());
});

$("loop").addEventListener("change", () => {
  if (node) node.loop = $("loop").checked;
});
