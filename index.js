import { html, render } from "lit-html";

import { Bimp } from "./bimp/Bimp";

import { buildRepeatEditor } from "./repeatEditor";
import { buildColorChangeEditor } from "./colorChangeEditor";
import { buildNeedleEditor } from "./needleEditor";
import { buildPreview } from "./previewEditor";

import { download } from "./utils";

import { simulate } from "./simulation/yarnSimulation";
// import startState from "./patterns/hex_quilt.json";
import startState from "./patterns/pyramids.json";

let repeatEditor, colorChangeEditor, needleEditor, preview;

let clear, relax, flip;

let GLOBAL_STATE = {
  scale: 25,
  updateSim: false,
};

function loadWorkspace(workspace) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...workspace };
  GLOBAL_STATE.updateSim = true;
}

function downloadPNG() {
  download(
    document.getElementById("preview").toDataURL("image/png"),
    "chart.png"
  );
}

function downloadSilverKnitTxt() {
  const text =
    "SilverKnit\n" +
    repeatEditor.state.bitmap
      .make2d()
      .map((row) =>
        row
          .map((pixel) => {
            if (pixel == 0 || pixel == 1) return 8;
            else return 7;
          })
          .join("")
      )
      .join("\n");

  download(
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    "pattern.txt"
  );
}

function downloadJSON() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(
      JSON.stringify({
        yarnPalette: GLOBAL_STATE.yarnPalette,
        needles: needleEditor.state.bitmap.toJSON(),
        repeat: repeatEditor.state.bitmap.toJSON(),
        yarns: colorChangeEditor.state.bitmap.toJSON(),
      })
    );

  download(dataStr, "pattern.json");
}

function view() {
  return html`
    <div id="site-content">
      <div id="site-title" style="grid-area: title;">
        <span>knitscape</span>
      </div>

      <div id="left-controls" style="grid-area: lcontrols;">
        <div>
          <div class="dropdown-container">
            <i class="fa-solid fa-download"></i>
            <div class="dropdown">
              <div @click=${() => downloadJSON()}>Pattern JSON</div>
              <div @click=${() => downloadSilverKnitTxt()}>
                TXT (SilverKnit)
              </div>
              <div @click=${() => downloadPNG()}>Chart PNG</div>
            </div>
          </div>
        </div>
        <button
          @click=${() => {
            GLOBAL_STATE.scale = GLOBAL_STATE.scale + 1;
            syncScale();
          }}>
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>
        <button
          @click=${() => {
            GLOBAL_STATE.scale = GLOBAL_STATE.scale - 1;
            syncScale();
          }}>
          <i class="fa-solid fa-magnifying-glass-minus"></i>
        </button>
        <div id="repeat-tools"></div>
        <div id="repeat-palette"></div>
        <div id="repeat-height"></div>
      </div>
      <div class="lgutter" style="grid-area: lgutter;">
        <div class="preview"></div>
        <div class="repeat"></div>
      </div>
      <div id="pattern-container" style="grid-area: pattern;">
        <canvas id="preview"></canvas>
        <canvas id="repeat"></canvas>
      </div>

      <div class="bgutter" style="grid-area: bgutter;">
        <div class="preview"></div>
        <div class="repeat"></div>
      </div>

      <div id="bottom-controls" style="grid-area: bcontrols;">
        <div id="repeat-width"></div>
        <div id="needle-width"></div>
      </div>

      <div id="color-change-container" style="grid-area: colors;">
        <div id="height-dragger">
          <div id="color-dragger" class="dragger vertical grab">
            <i class="fa-solid fa-grip fa-xs"></i>
          </div>
          <canvas id="color-change-editor" height="25" width="25"></canvas>
        </div>
        <div id="color-controls">
          <div id="yarn-palette"></div>
        </div>
      </div>

      <div id="needle-container" style="grid-area: needles;">
        <canvas id="needle-editor"></canvas>
        <div id="needle-dragger" class="dragger horizontal grab">
          <i class="fa-solid fa-grip-vertical fa-xs"></i>
        </div>
      </div>

      <div id="sim-container" style="grid-area: sim">
        <div id="sim-controls" style="grid-area: simcontrols">
          <button @click=${() => relax()}>relax</button>
          <button @click=${() => flip()}>flip</button>
        </div>
        <svg id="simulation"></svg>
      </div>
    </div>
  `;
}

function regenPreview() {
  const { colorLayer, symbolLayer } = generateYarnPreview(
    Bimp.fromJSON(repeatEditor.state.bitmap),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    colorChangeEditor.state.bitmap.vMirror().pixels
  );

  preview.dispatch({
    bitmap: colorLayer,
    symbolMap: symbolLayer,
  });

  GLOBAL_STATE.updateSim = true;
}

function syncScale() {
  const bbox = document
    .getElementById("pattern-container")
    .getBoundingClientRect();

  GLOBAL_STATE.previewX = Math.floor(bbox.width / GLOBAL_STATE.scale);
  GLOBAL_STATE.previewY = Math.floor(bbox.height / GLOBAL_STATE.scale);

  const scale = GLOBAL_STATE.scale;

  repeatEditor.dispatch({ scale });
  colorChangeEditor.dispatch({ scale });
  needleEditor.dispatch({ scale });
  preview.dispatch({ scale });

  regenPreview();

  runSimulation();
}

function generateYarnPreview(repeat, width, height, yarnChanges) {
  let tiled = Bimp.fromTile(width, height, repeat.vMirror());

  let recolor = [];
  let stitchMap = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      recolor.push(yarnChanges[y % yarnChanges.length]);
      stitchMap.push(tiled.pixel(x, y));
    }
  }

  let colored = new Bimp(width, height, recolor);
  let stitches = new Bimp(width, height, stitchMap);

  return { colorLayer: colored.vMirror(), symbolLayer: stitches.vMirror() };
}

function runSimulation() {
  if (!GLOBAL_STATE.updateSim) return;
  GLOBAL_STATE.updateSim = false;

  if (clear) clear();

  ({ clear, relax, flip } = simulate(
    preview.state.symbolMap,
    colorChangeEditor.state.bitmap.pixels,
    GLOBAL_STATE.yarnPalette
  ));
}

window.onmouseup = function () {
  runSimulation();
};

async function init() {
  loadWorkspace(startState);
  render(view(), document.body);

  let repeatEditorCanvas = document.getElementById("repeat");
  let colorChangeEditorCanvas = document.getElementById("color-change-editor");
  let previewCanvas = document.getElementById("preview");
  let needleEditorCanvas = document.getElementById("needle-editor");

  // Make the initial bitmaps based on global state
  let initial = generateYarnPreview(
    Bimp.fromJSON(GLOBAL_STATE.repeat),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );

  // Build all the editors
  repeatEditor = await buildRepeatEditor(
    GLOBAL_STATE,
    repeatEditorCanvas,
    previewCanvas
  );
  colorChangeEditor = buildColorChangeEditor(
    GLOBAL_STATE,
    colorChangeEditorCanvas
  );
  needleEditor = await buildNeedleEditor(GLOBAL_STATE, needleEditorCanvas);
  preview = await buildPreview(GLOBAL_STATE, previewCanvas, initial);

  // Synchronize editor changes
  repeatEditor.addEffect("bitmap", regenPreview);
  colorChangeEditor.addEffect("bitmap", regenPreview);

  // Sync changes to palette
  colorChangeEditor.addEffect("palette", ({ palette }) => {
    GLOBAL_STATE.yarnPalette = palette;
    GLOBAL_STATE.updateSim = true;

    preview.dispatch({
      palette,
    });
  });

  // Sync mouse position between preview and repeat editor
  preview.addEffect("pos", ({ bitmap, pos }) => {
    if (pos.x > -1 || pos.y > -1) {
      let newX = pos.x % repeatEditor.state.bitmap.width;
      let newY =
        repeatEditor.state.bitmap.height -
        ((bitmap.height - pos.y) % repeatEditor.state.bitmap.height);

      newY = newY == repeatEditor.state.bitmap.height ? 0 : newY;
      repeatEditor.dispatch({
        pos: {
          x: newX,
          y: newY,
        },
      });
    }
  });

  // Finally, explicitly synchronize the scale and run the sim
  syncScale();
  runSimulation();
}

window.onload = init;
