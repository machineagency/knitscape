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
import { pointerTracker } from "./bitmapEditor/pointerPosition";

let GLOBAL_STATE = startState;

let STATEEE = {
  repeat: {},
  yarns: {},
  yarnChanges: {},
  needlesInWork: {},
};

let repeatEditorCanvas,
  colorChangeEditorCanvas,
  needleEditorCanvas,
  previewCanvas;
let repeatEditor, colorChangeEditor, needleEditor, preview;

import knitUrl from "./stitchSymbols/knit.png";
import slipUrl from "./stitchSymbols/slip.png";
import tuckUrl from "./stitchSymbols/tuck.png";
import purlUrl from "./stitchSymbols/purl.png";

function view(state) {
  return html`
    <div id="left">
      <div id="repeat-editor-container">
        <canvas id="repeat-editor"></canvas>
        <div id="repeat-tools"></div>
      </div>
      <div id="yarn-library"></div>
    </div>
    <div id="center">
      <div id="color-change-editor-container">
        <canvas id="color-change-editor"></canvas>
      </div>
      <div id="preview-gutter-vertical"></div>
      <div id="preview-container"><canvas id="preview"></canvas></div>
      <div id="preview-gutter-horizontal"></div>
      <div id="needle-work-editor-container">
        <canvas id="needle-work-editor"></canvas>
      </div>
      <div id="preview-controls"></div>
    </div>
  `;
}

function sync() {}

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

async function init() {
  render(view(), document.body);

  repeatEditorCanvas = document.getElementById("repeat-editor");
  colorChangeEditorCanvas = document.getElementById("color-change-editor");
  previewCanvas = document.getElementById("preview");
  needleEditorCanvas = document.getElementById("needle-work-editor");

  colorChangeEditor = new BimpEditor({
    state: {
      activeYarn: 0,
      bitmap: Bimp.fromJSON(GLOBAL_STATE.yarns).vMirror(),
      aspectRatio: [1, 1],
      scale: 1,
      pan: { x: 0, y: 0 },
    },

    components: [
      pointerTracker({ target: colorChangeEditorCanvas }),
      drawingCanvas({
        canvas: colorChangeEditorCanvas,
        paletteBuilder: buildHexPalette(GLOBAL_STATE.yarnPalette),
      }),
      toolbox({
        tools: { brush },
        container: null,
        target: colorChangeEditorCanvas,
      }),
    ],
  });

  repeatEditor = new BimpEditor({
    state: {
      activeYarn: 0,
      bitmap: Bimp.fromJSON(GLOBAL_STATE.repeat),
      aspectRatio: [1, 1],
      scale: 1,
      pan: { x: 0, y: 0 },
    },

    components: [
      pointerTracker({ target: repeatEditorCanvas }),
      drawingCanvas({
        canvas: repeatEditorCanvas,
        paletteBuilder: buildHexPalette(GLOBAL_STATE.yarnPalette),
      }),
      toolbox({
        tools: { brush, flood, line, rect, shift },
        container: null,
        target: repeatEditorCanvas,
      }),
    ],
  });

  preview = new BimpEditor({
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

    components: [
      drawingCanvas({
        canvas: previewCanvas,
        paletteBuilder: buildHexPalette(GLOBAL_STATE.yarnPalette),
      }),
    ],
  });
}

init();
