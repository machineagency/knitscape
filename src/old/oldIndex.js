import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";
import { when } from "lit-html/directives/when.js";
import Split from "split.js";

// import { Bimp } from "./bimp/Bimp";

// import { buildRepeatEditor } from "./editors/repeatEditor";
// import { buildColorChangeEditor } from "./editors/colorChangeEditor";
// import { buildNeedleEditor } from "./editors/needleEditor";
// import { buildPreview } from "./editors/previewEditor";

// import { simulate } from "./simulation/yarnSimulation";

import { GLOBAL_STATE, KnitScape, loadWorkspace, dispatch } from "./state";

// import startState from "../patterns/ovals.json";

import { fitChart } from "./actions/zoomFit";

import { chartCanvas } from "./components/chartCanvas";
import { gridCanvas } from "./components/gridCanvas";
import { outlineCanvas } from "./components/outlineCanvas";

import { addKeypressListeners } from "./events/keypressEvents";
import { chartPointerInteraction } from "./events/chartPointerInteraction";
import { closeModals } from "./events/closeModals";
import { trackPointer } from "./events/trackPointer";

import { taskbar } from "./views/taskbar";
import { downloadModal } from "./views/downloadModal";
import { libraryModal } from "./views/libraryModal";
import { settingsModal } from "./views/settingsModal";
import { debugPane } from "./views/debugPane";

import { pointer, pointerIcon } from "./components/pointer";

import { isMobile } from "./utils";

// let repeatEditor, colorChangeEditor, needleEditor, preview;
// let clear, relax, flip;

function widthSpinner() {
  return html`<div class="spinner horizontal">
    <button
      class="minus"
      @click=${() => {
        GLOBAL_STATE.simWidth = GLOBAL_STATE.simWidth - 1;
        GLOBAL_STATE.updateSim = true;
      }}>
      <i class="fa-solid fa-minus"></i>
    </button>
    <input
      type="text"
      .value=${live(GLOBAL_STATE.simWidth.toString())}
      class="size-input"
      @change=${(e) => {
        GLOBAL_STATE.simWidth = Number(e.target.value);
        GLOBAL_STATE.updateSim = true;
      }} />
    <button
      class="plus"
      @click=${() => {
        GLOBAL_STATE.simWidth = GLOBAL_STATE.simWidth + 1;
        GLOBAL_STATE.updateSim = true;
      }}>
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>`;
}

function heightSpinner() {
  return html`<div class="spinner horizontal">
    <button
      class="minus"
      @click=${() => {
        GLOBAL_STATE.simHeight = GLOBAL_STATE.simHeight - 1;
        GLOBAL_STATE.updateSim = true;
      }}>
      <i class="fa-solid fa-minus"></i>
    </button>
    <input
      type="text"
      .value=${live(GLOBAL_STATE.simHeight.toString())}
      class="size-input"
      @change=${(e) => {
        GLOBAL_STATE.simHeight = Number(e.target.value);
        GLOBAL_STATE.updateSim = true;
      }} />
    <button
      class="plus"
      @click=${() => {
        GLOBAL_STATE.simHeight = GLOBAL_STATE.simHeight + 1;
        GLOBAL_STATE.updateSim = true;
      }}>
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>`;
}

function oldView() {
  return html`
    ${taskbar(dispatch, loadJSON)}
    ${when(GLOBAL_STATE.showDownload, () => downloadModal(dispatch, loadJSON))}
    ${when(GLOBAL_STATE.showLibrary, () => libraryModal(dispatch, loadJSON))}
    ${when(GLOBAL_STATE.showSettings, () => settingsModal())}

    <div id="site">
      <div id="download-modal-container"></div>
      <div id="left-controls" style="grid-area: lcontrols;">
        <button
          @click=${() => {
            if (devicePixelRatio == 1) {
              GLOBAL_STATE.scale = GLOBAL_STATE.scale + 1;
            } else {
              GLOBAL_STATE.scale =
                GLOBAL_STATE.scale + devicePixelRatio / (devicePixelRatio - 1);
            }
            syncScale();
          }}>
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>
        <button
          @click=${() => {
            if (devicePixelRatio == 1) {
              GLOBAL_STATE.scale = GLOBAL_STATE.scale - 1;
            } else {
              GLOBAL_STATE.scale =
                GLOBAL_STATE.scale - devicePixelRatio / (devicePixelRatio - 1);
            }
            syncScale();
          }}>
          <i class="fa-solid fa-magnifying-glass-minus"></i>
        </button>
        <div id="repeat-tools"></div>
        <div id="repeat-palette"></div>
      </div>
      <div class="lgutter" style="grid-area: lgutter;">
        <div class="preview"></div>
        <div class="repeat"></div>
      </div>
      <div
        class="pattern-container"
        id="pattern-container"
        style="grid-area: pattern;">
        <canvas id="preview"></canvas>
        <canvas id="preview-symbols"></canvas>
        <canvas id="preview-needles"></canvas>
        <canvas id="repeat"></canvas>
        <canvas id="pattern-highlight"></canvas>
        <canvas id="pattern-grid" style="image-rendering:pixelated"></canvas>
      </div>

      <div class="bgutter" style="grid-area: bgutter;">
        <div class="preview"></div>
        <div class="repeat"></div>
      </div>

      <div id="color-change-container" style="grid-area: colors;">
        <div id="height-dragger">
          <div id="color-dragger" class="dragger vertical grab">
            <i class="fa-solid fa-grip fa-xs"></i>
          </div>
          <canvas id="color-change-editor" height="25" width="25"></canvas>
          <canvas
            id="color-change-grid"
            height="25"
            width="25"
            style="image-rendering:pixelated"></canvas>
        </div>
        <div id="color-controls">
          <div id="yarn-palette"></div>
        </div>
      </div>
      <div id="size-container" style="grid-area: size;">
        <div id="repeat-width"></div>
        <div id="repeat-height"></div>
      </div>
      <div id="needle-container" style="grid-area: needles;">
        <canvas id="needle-editor" height="25" width="25"></canvas>
        <div id="needle-dragger" class="dragger horizontal grab">
          <i class="fa-solid fa-grip-vertical fa-xs"></i>
        </div>
      </div>
      <div id="sim-controls" style="grid-area: simcontrols">
        ${widthSpinner()} ${heightSpinner()}
        <button @click=${() => relax()}>relax</button>
        <button @click=${() => flip()}>flip</button>
      </div>
      <div id="sim-container" style="grid-area: sim">
        <svg id="simulation"></svg>
      </div>
      ${when(GLOBAL_STATE.showDebugPane, debugPane)}
    </div>
  `;
}

function regenPreview() {
  const { colorLayer, symbolLayer } = generateYarnPreview(
    Bimp.fromJSON(repeatEditor.state.bitmap),
    colorChangeEditor.state.bitmap.vMirror().pixels
  );

  preview.dispatch({
    bitmap: colorLayer,
    symbolMap: symbolLayer,
    scale: GLOBAL_STATE.scale / devicePixelRatio,
    needles: Array.from(needleEditor.state.bitmap.pixels),
  });

  GLOBAL_STATE.updateSim = true;
}

function syncScale() {
  const bbox = document
    .getElementById("pattern-container")
    .getBoundingClientRect();

  const actualX = bbox.width * devicePixelRatio;
  const actualY = bbox.height * devicePixelRatio;

  const actualScale = GLOBAL_STATE.scale;

  GLOBAL_STATE.previewX = Math.floor(actualX / actualScale) - 1;
  GLOBAL_STATE.previewY = Math.floor(actualY / actualScale);

  const scale = actualScale / devicePixelRatio;

  repeatEditor.dispatch({ scale });
  colorChangeEditor.dispatch({ scale });
  preview.dispatch({ scale });
  needleEditor.dispatch({ scale });

  regenPreview();
}

function generateYarnPreview(repeat, yarnChanges) {
  let width = GLOBAL_STATE.previewX;
  let height = GLOBAL_STATE.previewY;
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
  render(view(), document.body);

  if (!GLOBAL_STATE.updateSim) return;
  GLOBAL_STATE.updateSim = false;

  if (clear) clear();

  ({ clear, relax, flip } = simulate(
    Bimp.fromTile(
      GLOBAL_STATE.simWidth,
      GLOBAL_STATE.simHeight,
      repeatEditor.state.bitmap.vMirror()
    ).vMirror(),
    colorChangeEditor.state.bitmap.pixels,
    Array.from(needleEditor.state.bitmap.pixels),
    GLOBAL_STATE.yarnPalette
  ));
}

// window.onmouseup = function () {
//   setTimeout(() => runSimulation(), 30);
// };

// async function init() {
//   loadWorkspace(startState);
//   render(view(), document.body);

//   let repeatEditorCanvas = document.getElementById("repeat");
//   let colorChangeEditorCanvas = document.getElementById("color-change-editor");
//   let needleEditorCanvas = document.getElementById("needle-editor");

//   // Make the initial bitmaps based on global state
//   let initial = generateYarnPreview(
//     Bimp.fromJSON(GLOBAL_STATE.repeat),
//     GLOBAL_STATE.yarns.pixels
//   );

//   // Build all the editors
//   repeatEditor = await buildRepeatEditor(GLOBAL_STATE, repeatEditorCanvas);
//   colorChangeEditor = buildColorChangeEditor(
//     GLOBAL_STATE,
//     colorChangeEditorCanvas
//   );
//   needleEditor = await buildNeedleEditor(GLOBAL_STATE, needleEditorCanvas);
//   preview = await buildPreview(GLOBAL_STATE, initial);

//   // Synchronize editor changes
//   repeatEditor.addEffect("bitmap", regenPreview);
//   needleEditor.addEffect("bitmap", regenPreview);

//   colorChangeEditor.addEffect("bitmap", regenPreview);

//   // Sync changes to palette
//   colorChangeEditor.addEffect("palette", ({ palette }) => {
//     GLOBAL_STATE.yarnPalette = palette;
//     GLOBAL_STATE.updateSim = true;

//     preview.dispatch({
//       palette,
//     });

//     runSimulation();
//   });

//   // Sync mouse position between preview and repeat editor
//   preview.addEffect("pos", ({ bitmap, pos }) => {
//     if (pos.x > -1 || pos.y > -1) {
//       let newX = pos.x % repeatEditor.state.bitmap.width;
//       let newY =
//         repeatEditor.state.bitmap.height -
//         ((bitmap.height - pos.y) % repeatEditor.state.bitmap.height);

//       newY = newY == repeatEditor.state.bitmap.height ? 0 : newY;
//       repeatEditor.dispatch({
//         pos: {
//           x: newX,
//           y: newY,
//         },
//       });
//     }
//   });

//   // Finally, explicitly synchronize the scale and run the sim
//   syncScale();
//   runSimulation();
// }

const iconMap = {
  flood: "fa-fill-drip fa-flip-horizontal",
  brush: "fa-paintbrush",
  rect: "fa-vector-square",
  line: "fa-minus",
  shift: "fa-up-down-left-right",
  eyedropper: "fa-eyedropper",
};

function view() {
  return html`
    ${taskbar()} ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)}

    <div id="site">
      <div id="edit-pane">
        <div id="tools-container"></div>
        <div id="editors-container">
          <div id="gutter-top"></div>
          <div id="editors-inner">
            <div id="gutter-left"></div>
            <div id="color-sequence-container"></div>
            <div id="layers-container">
              ${pointer()}
              <div
                id="canvas-transform-group"
                style="transform: translate(${GLOBAL_STATE.chartPan
                  .x}px, ${GLOBAL_STATE.chartPan.y}px);">
                <canvas id="chart"></canvas>
                <!-- <canvas id="preview-symbols"></canvas>
                <canvas id="preview-needles"></canvas>
                <canvas id="repeat"></canvas> -->
                <canvas id="grid"></canvas>
                <canvas id="outline"></canvas>
              </div>
            </div>
            <div id="color-sequence-container"></div>
            <div id="gutter-right"></div>
          </div>
          <div id="gutter-bottom"></div>
        </div>
        <div id="palette-container"></div>
      </div>
      <div id="view-pane"></div>
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function initKeyboard() {
  addKeypressListeners();
  trackPointer({ target: document.getElementById("outline") });
  chartPointerInteraction({
    target: document.getElementById("outline"),
    workspace: document.getElementById("layers-container"),
  });
  closeModals();
}

function initTouch() {
  closeModals();
}

function calcSplit() {
  const portrait = screen.availHeight > screen.availWidth;
  document
    .getElementById("site")
    .style.setProperty("flex-direction", portrait ? "column" : "row");

  return portrait
    ? Split(["#edit-pane", "#view-pane"], {
        minSize: 300,
        gutterSize: 11,
        direction: "vertical",
      })
    : Split(["#edit-pane", "#view-pane"], {
        minSize: 300,
        gutterSize: 11,
      });
}

function init() {
  r();
  let split = calcSplit();
  isMobile() ? initTouch() : initKeyboard();
  KnitScape.register([
    chartCanvas({ canvas: document.getElementById("chart") }),
    gridCanvas({ canvas: document.getElementById("grid") }),
    outlineCanvas({ canvas: document.getElementById("outline") }),
  ]);

  fitChart();
}

window.onload = init;
