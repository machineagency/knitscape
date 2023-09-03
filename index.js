import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

import { Bimp } from "./bimp/Bimp";
import { BimpEditor } from "./bimp/BimpEditor";
import { fieldMonitor } from "./bimp/stateFieldMonitor";
import { canvasScaler } from "./bimp/canvasScaler";
import { pointerTracker } from "./bimp/pointerTracker";
import { grid } from "./bimp/grid";
import { highlight } from "./bimp/highlight";

import { paletteRenderer } from "./bimp/paletteRenderer";
import { hexPalette, imagePalette } from "./bimp/palettes";

import { pointerEvents } from "./bimp/pointerEvents";
import { brush, flood, line, rect, shift } from "./bimp/tools";
import { stateHook } from "./bimp/stateHook";

import startState from "./startState.json";

import {
  stitchSymbolPalette,
  transparentStitchPalette,
} from "./stitchSymbolPalette";

import { buildColorChangeEditor } from "./colorChangeEditor";

import { renderPreview } from "./simulation/yarnSimulation";

const iconMap = {
  flood: "fa-fill-drip",
  brush: "fa-paintbrush",
  rect: "fa-vector-square",
  line: "fa-minus",
  shift: "fa-up-down-left-right",
};

let GLOBAL_STATE = startState;

GLOBAL_STATE.mouseDown = 0;
document.body.onmousedown = function () {
  ++GLOBAL_STATE.mouseDown;
};
document.body.onmouseup = function () {
  --GLOBAL_STATE.mouseDown;
};

let clear, relax, flip;
let timeoutID;

let repeatEditorCanvas,
  colorChangeEditorCanvas,
  needleEditorCanvas,
  previewCanvas;

let repeatEditor, colorChangeEditor, needleEditor, preview;

function view() {
  return html`
    <div id="site-content">
      <div id="site-title" style="grid-area: title;">
        <span>knitscape</span>
      </div>

      <div id="left-controls" style="grid-area: lcontrols;">
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
      <!-- <div style="grid-area: needles;">
        <canvas id="needle-work-editor"></canvas>
      </div> -->
      <div id="bottom-controls" style="grid-area: bcontrols;">
        <div id="repeat-width"></div>
      </div>

      <div id="color-change-container" style="grid-area: colors;">
        <canvas id="color-change-editor" height="25" width="25"></canvas>
        <div id="color-controls">
          <div id="yarn-palette"></div>
          <div id="color-height"></div>
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

function bottomLeft({ bitmap }, axis) {
  if (axis == "horizontal") {
    return Array.apply(null, Array(bitmap.width)).map((x, i) => i + 1);
  } else if (axis == "vertical") {
    return Array.apply(null, Array(bitmap.height))
      .map((x, i) => i + 1)
      .reverse();
  }
}

function gutterView({ gutterFunc, container, axis }) {
  return (state, dispatch) => {
    let arr = gutterFunc(state, axis);

    function checkHighlight(num) {
      if (axis == "horizontal" && state.pos.x == num) {
        return true;
      } else if (axis == "vertical" && state.pos.y == num) {
        return true;
      } else {
        return false;
      }
    }
    render(
      html`<div class="gutter ${axis}" style="--scale:${state.scale}px;">
        ${arr.map(
          (content, index) =>
            html`<div class="cell ${checkHighlight(index) ? "highlight" : ""}">
              ${content}
            </div>`
        )}
      </div>`,
      container
    );
  };
}

function widthSpinner({ container }) {
  return (state, dispatch) => {
    let { bitmap } = state;
    render(
      html`<div class="spinner horizontal">
        <button
          class="minus"
          @click=${() =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width - 1, bitmap.height),
            })}>
          <i class="fa-solid fa-minus"></i>
        </button>

        <input
          type="text"
          .value=${live(bitmap.width)}
          class="size-input"
          @change=${(e) =>
            dispatch({
              bitmap: bitmap.resize(Number(e.target.value), bitmap.height),
            })} />
        <button
          class="plus"
          @click=${() =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width + 1, bitmap.height),
            })}>
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>`,
      container
    );
  };
}

function heightSpinner({ container }) {
  return (state, dispatch) => {
    let { bitmap } = state;
    render(
      html`<div class="spinner vertical">
        <button
          class="plus"
          @click=${() =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width, bitmap.height + 1),
            })}>
          <i class="fa-solid fa-plus"></i>
        </button>
        <input
          type="text"
          .value=${live(bitmap.height)}
          class="size-input"
          @change=${(e) =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width, Number(e.target.value)),
            })} />

        <button
          class="minus"
          @click=${() =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width, bitmap.height - 1),
            })}>
          <i class="fa-solid fa-minus"></i>
        </button>
      </div>`,
      container
    );
  };
}

function toolSelectView(tools, container) {
  return (state, dispatch) =>
    render(
      html`<div class="tool-select">
        ${Object.keys(tools).map(
          (tool) =>
            html`<button
              class=${state.activeTool == tool ? "active" : ""}
              @click=${() => dispatch({ activeTool: tool })}>
              <i class="fa-solid ${iconMap[tool]}"></i>
            </button>`
        )}
      </div>`,
      container
    );
}

function imagePaletteSelect(palette, container) {
  return (state, dispatch) =>
    render(
      html`
        <div class="palette-select">
          ${palette.map(
            ({ image, title }, index) =>
              html`<img
                class=${index == state.paletteIndex ? "selected" : ""}
                src=${image.src}
                title=${title}
                @click=${() => dispatch({ paletteIndex: index })} />`
          )}
        </div>
      `,
      container
    );
}

async function buildRepeatEditor() {
  let repeatTools = { brush, flood, line, rect, shift };

  const palette = await stitchSymbolPalette();
  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(GLOBAL_STATE.repeat),
      palette,
      canvas: repeatEditorCanvas,
    },
    components: [
      pointerTracker({ target: repeatEditorCanvas }),
      canvasScaler(),
      pointerEvents({
        tools: repeatTools,
        eventTarget: repeatEditorCanvas,
      }),
      pointerEvents({
        tools: repeatTools,
        eventTarget: previewCanvas,
      }),
      paletteRenderer({ drawFunc: imagePalette }),
      grid(),
      highlight(),
      stateHook({
        check: fieldMonitor("activeTool"),
        cb: toolSelectView(
          repeatTools,
          document.getElementById("repeat-tools")
        ),
      }),
      stateHook({
        check: fieldMonitor("paletteIndex"),
        cb: imagePaletteSelect(
          palette,
          document.getElementById("repeat-palette")
        ),
      }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.querySelector(".bgutter .repeat"),
          axis: "horizontal",
        }),
      }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.querySelector(".lgutter .repeat"),
          axis: "vertical",
        }),
      }),
      stateHook({
        cb: heightSpinner({
          container: document.getElementById("repeat-height"),
        }),
      }),
      stateHook({
        cb: widthSpinner({
          container: document.getElementById("repeat-width"),
        }),
      }),
    ],
  });
}

// function buildNeedleEditor() {
//   return new BimpEditor({
//     state: {
//       bitmap: Bimp.fromJSON(GLOBAL_STATE.needles),
//       palette: ["#ffffff", "#000000"],
//       canvas: needleEditorCanvas,
//     },

//     components: [
//       pointerTracker({ target: needleEditorCanvas }),
//       scaledCanvas({}),
//       paletteRenderer({
//         drawFunc: hexPalette,
//       }),
//       pointerEvents({
//         tools: { brush },
//         eventTarget: needleEditorCanvas,
//       }),
//       grid({ lineColor: "#999999" }),
//     ],
//   });
// }

async function buildPreview() {
  const stitchSymbolPalette = await transparentStitchPalette();

  const { colorLayer, symbolLayer } = generateYarnPreview(
    Bimp.fromJSON(GLOBAL_STATE.repeat),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );

  return new BimpEditor({
    state: {
      bitmap: colorLayer,
      symbolMap: symbolLayer,
      scale: GLOBAL_STATE.scale,
      palette: GLOBAL_STATE.yarnPalette,
      stitchPalette: stitchSymbolPalette,
      canvas: previewCanvas,
    },

    components: [
      pointerTracker({ target: previewCanvas }),
      canvasScaler(),
      paletteRenderer({ drawFunc: hexPalette }),
      paletteRenderer({
        drawFunc: imagePalette,
        paletteOverride: "stitchPalette",
        bitmapOverride: "symbolMap",
      }),
      grid(),
      highlight(),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.querySelector(".bgutter .preview"),
          axis: "horizontal",
        }),
      }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.querySelector(".lgutter .preview"),
          axis: "vertical",
        }),
      }),
    ],
  });
}

function syncRepeat(state) {
  const { colorLayer, symbolLayer } = generateYarnPreview(
    Bimp.fromJSON(state.bitmap),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );
  preview.dispatch({
    bitmap: colorLayer,
    symbolMap: symbolLayer,
  });
  runSimulation(symbolLayer);
}

function syncYarnChanges(state) {
  GLOBAL_STATE.yarns.pixels = state.bitmap.vMirror().pixels;

  const { colorLayer, symbolLayer } = generateYarnPreview(
    Bimp.fromJSON(repeatEditor.state.bitmap),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );

  preview.dispatch({
    bitmap: colorLayer,
    symbolMap: symbolLayer,
  });

  runSimulation(symbolLayer);
}

function syncScale() {
  const bbox = document
    .getElementById("pattern-container")
    .getBoundingClientRect();

  GLOBAL_STATE.previewX = Math.floor(bbox.width / GLOBAL_STATE.scale);
  GLOBAL_STATE.previewY = Math.floor(bbox.height / GLOBAL_STATE.scale);

  const scale = GLOBAL_STATE.scale;

  const { colorLayer, symbolLayer } = generateYarnPreview(
    Bimp.fromJSON(repeatEditor.state.bitmap),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );

  repeatEditor.dispatch({
    scale,
  });
  colorChangeEditor.dispatch({
    scale,
  });
  preview.dispatch({
    scale,
    bitmap: colorLayer,
    symbolMap: symbolLayer,
  });
  runSimulation(symbolLayer);

  // needleEditor.dispatch({
  //   scale: state.scale,
  // });
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

function runSimulation(symbolLayer) {
  if (timeoutID) clearTimeout(timeoutID);
  timeoutID = setTimeout(() => {
    if (clear) clear();
    clear = null;
    ({ clear, relax, flip } = renderPreview(
      symbolLayer,
      colorChangeEditor.state.bitmap.pixels,
      GLOBAL_STATE.yarnPalette
    ));
  }, 200);
}

async function init() {
  render(view(), document.body);
  repeatEditorCanvas = document.getElementById("repeat");
  colorChangeEditorCanvas = document.getElementById("color-change-editor");
  previewCanvas = document.getElementById("preview");
  needleEditorCanvas = document.getElementById("needle-work-editor");

  repeatEditor = await buildRepeatEditor();
  colorChangeEditor = buildColorChangeEditor(
    GLOBAL_STATE,
    colorChangeEditorCanvas
  );
  // needleEditor = buildNeedleEditor();

  preview = await buildPreview();
  repeatEditor.addEffect("bitmap", syncRepeat);
  colorChangeEditor.addEffect("bitmap", syncYarnChanges);

  colorChangeEditor.addEffect("palette", ({ palette }) => {
    GLOBAL_STATE.yarnPalette = palette;
    preview.dispatch({
      palette,
    });

    const { symbolLayer } = generateYarnPreview(
      Bimp.fromJSON(repeatEditor.state.bitmap),
      GLOBAL_STATE.previewX,
      GLOBAL_STATE.previewY,
      GLOBAL_STATE.yarns.pixels
    );
    runSimulation(symbolLayer);
  });

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
  syncScale();
}

window.onload = init;
