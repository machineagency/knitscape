import { html, render } from "lit-html";
import { Bimp } from "./bitmapEditor/Bimp";
import { drawingCanvas } from "./bitmapEditor/drawingCanvas";
import { buildSymbolPalette, buildHexPalette } from "./bitmapEditor/palette";
import { BimpEditor } from "./bitmapEditor/BimpEditor";
import startState from "./startState.json";
import { grid } from "./bitmapEditor/grid";
import { highlight } from "./bitmapEditor/highlight";
import { toolbox } from "./bitmapEditor/toolbox";
import { brush, flood, line, rect, shift, pan } from "./bitmapEditor/tools";
import { heightControl, controlPanel } from "./bitmapEditor/controlPanel";
import { numberGutter } from "./bitmapEditor/numberGutter";
import { colorNumberGutter } from "./bitmapEditor/colorNumberGutter";

let GLOBAL_STATE = startState;

import knitUrl from "./stitchSymbols/knit.png";
import slipUrl from "./stitchSymbols/slip.png";
import tuckUrl from "./stitchSymbols/tuck.png";
import purlUrl from "./stitchSymbols/purl.png";

let repeatEditor, preview, yarnEditor;

function bottomLeft({ bitmap }, gutterPos, size) {
  if (gutterPos == "bottom" || gutterPos == "top") {
    return Array.apply(null, Array(bitmap.width)).map((x, i) => i + 1);
  } else if (gutterPos == "left" || gutterPos == "right") {
    return Array.apply(null, Array(bitmap.height))
      .map((x, i) => i + 1)
      .reverse();
  }
}

async function initPalette() {
  const knit = new Image();
  knit.src = knitUrl;
  await knit.decode();
  const slip = new Image();
  slip.src = slipUrl;
  await slip.decode();
  const tuck = new Image();
  tuck.src = tuckUrl;
  await tuck.decode();
  const purl = new Image();
  purl.src = purlUrl;
  await purl.decode();

  return {
    symbols: [
      { image: knit, title: "Knit" },
      { image: purl, title: "Purl" },
      { image: slip, title: "Slip" },
      { image: tuck, title: "Tuck" },
    ],
  };
}

function view(state) {
  return html`
    <div id="repeat"></div>
    <div id="yarn"></div>
    <div id="preview"></div>
  `;
}

async function makeRepeatEditor() {
  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(GLOBAL_STATE.repeat),
      aspectRatio: [1, 1],
      scale: 1,
      pan: { x: 0, y: 0 },
    },
    parent: document.getElementById("repeat"),
    components: [
      drawingCanvas({
        paletteBuilder: buildSymbolPalette(await initPalette()),
        palettePosition: "taskbarSecondary",
      }),
      grid(),
      highlight({ cell: true }),
      toolbox({ tools: { brush, flood, line, rect, shift, pan } }),
      controlPanel({ container: "taskbarSecondary" }),
      numberGutter({ size: 20, gutterPos: "left", gutterFunc: bottomLeft }),
      numberGutter({
        size: 20,
        gutterPos: "bottom",
        gutterFunc: bottomLeft,
      }),
    ],
  });
}

function generateYarnPreview(repeat, x, y, yarnChanges) {
  const height = repeat.height * y;
  const width = repeat.width * x;

  let tiled = Bimp.fromTile(width, height, repeat.vMirror());

  let recolor = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiled.pixel(x, y) == 0) {
        recolor.push(yarnChanges[y % yarnChanges.length]);
      } else {
        recolor.push(-1);
      }
    }
  }

  let colored = new Bimp(width, height, recolor);
  return colored.vMirror();
}

function makePreview() {
  return new BimpEditor({
    state: {
      activeYarn: 0,
      bitmap: generateYarnPreview(
        Bimp.fromJSON(GLOBAL_STATE.repeat),
        GLOBAL_STATE.previewX,
        GLOBAL_STATE.previewY,
        GLOBAL_STATE.yarns.pixels
      ),
      aspectRatio: [1, 1],
      scale: 1,
      pan: { x: 0, y: 0 },
    },
    parent: document.getElementById("preview"),
    components: [
      drawingCanvas({
        paletteBuilder: buildHexPalette(GLOBAL_STATE.yarnPalette),
        palettePosition: null,
      }),
      grid(),
      highlight({ cell: true }),
      colorNumberGutter({
        size: 20,
        gutterPos: "left",
        gutterFunc: bottomLeft,
      }),
      colorNumberGutter({
        size: 20,
        gutterPos: "bottom",
        gutterFunc: bottomLeft,
      }),
    ],
  });
}

function makeYarnEditor() {
  return new BimpEditor({
    state: {
      activeYarn: 0,
      bitmap: Bimp.fromJSON(GLOBAL_STATE.yarns).vMirror(),
      aspectRatio: [1, 1],
      scale: 1,
      pan: { x: 0, y: 0 },
    },
    parent: document.getElementById("yarn"),
    components: [
      drawingCanvas({
        paletteBuilder: buildHexPalette(GLOBAL_STATE.yarnPalette),
        palettePosition: "taskbarSecondary",
      }),
      toolbox({ tools: { brush }, container: null }),
      grid(),
      highlight({ cell: true }),
      numberGutter({
        size: 20,
        gutterPos: "left",
        gutterFunc: bottomLeft,
      }),
      controlPanel({
        controls: [heightControl()],
        container: "taskbarSecondary",
      }),
    ],
  });
}

render(view(), document.body);

function syncRepeat({ state }) {
  let { bitmap } = state;
  return {
    syncState(state) {
      if (state.bitmap == bitmap) return;
      bitmap = state.bitmap;

      const tiled = generateYarnPreview(
        Bimp.fromJSON(bitmap),
        GLOBAL_STATE.previewX,
        GLOBAL_STATE.previewY,
        GLOBAL_STATE.yarns.pixels
      );

      preview.dispatch({
        bitmap: tiled,
      });
    },
  };
}

function syncYarnChanges({ state }) {
  let { bitmap } = state;
  return {
    syncState(state) {
      if (state.bitmap == bitmap) return;
      GLOBAL_STATE.yarns.pixels = state.bitmap.vMirror().pixels;
      bitmap = state.bitmap;

      const tiled = generateYarnPreview(
        Bimp.fromJSON(repeatEditor.state.bitmap),
        GLOBAL_STATE.previewX,
        GLOBAL_STATE.previewY,
        GLOBAL_STATE.yarns.pixels
      );

      preview.dispatch({
        bitmap: tiled,
      });
    },
  };
}

async function init() {
  repeatEditor = await makeRepeatEditor();
  yarnEditor = makeYarnEditor();
  preview = makePreview();
  repeatEditor.addComponent(syncRepeat);
  yarnEditor.addComponent(syncYarnChanges);
}

init();
