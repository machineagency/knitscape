import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

import { Bimp } from "./bitmapEditor/Bimp";
import { BimpEditor } from "./bitmapEditor/BimpEditor";
import { fieldMonitor } from "./bitmapEditor/stateFieldMonitor";
import { scaledCanvas } from "./bitmapEditor/scaledCanvas";
import { canvasScaler } from "./bitmapEditor/canvasScaler";
import { pointerTracker } from "./bitmapEditor/pointerTracker";
import { grid } from "./bitmapEditor/grid";
import { highlight } from "./bitmapEditor/highlight";

import { paletteRenderer } from "./bitmapEditor/paletteRenderer";
import { hexPalette, imagePalette } from "./bitmapEditor/palettes";

import { pointerEvents } from "./bitmapEditor/pointerEvents";
import { brush, flood, line, rect, shift, pan } from "./bitmapEditor/tools";
import { stateHook } from "./bitmapEditor/stateHook";

import startState from "./startState.json";

import knitUrl from "./stitchSymbols/knit.png";
import slipUrl from "./stitchSymbols/slip.png";
import tuckUrl from "./stitchSymbols/tuck.png";
import purlUrl from "./stitchSymbols/purl.png";

import { buildColorChangeEditor } from "./colorChangeEditor";

const iconMap = {
  flood: "fa-fill-drip",
  brush: "fa-paintbrush",
  rect: "fa-vector-square",
  line: "fa-minus",
  shift: "fa-up-down-left-right",
};

async function stitchSymbolPalette() {
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

  return [
    { image: knit, title: "Knit" },
    { image: purl, title: "Purl" },
    { image: slip, title: "Slip" },
    { image: tuck, title: "Tuck" },
  ];
}

let GLOBAL_STATE = startState;

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

function buildNeedleEditor() {
  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(GLOBAL_STATE.needles),
      palette: ["#ffffff", "#000000"],
      canvas: needleEditorCanvas,
    },

    components: [
      pointerTracker({ target: needleEditorCanvas }),
      scaledCanvas({}),
      paletteRenderer({
        drawFunc: hexPalette,
      }),
      pointerEvents({
        tools: { brush },
        eventTarget: needleEditorCanvas,
      }),
      grid({ lineColor: "#999999" }),
    ],
  });
}

function buildPreview() {
  return new BimpEditor({
    state: {
      bitmap: generateYarnPreview(
        Bimp.fromJSON(GLOBAL_STATE.repeat),
        GLOBAL_STATE.previewX,
        GLOBAL_STATE.previewY,
        GLOBAL_STATE.yarns.pixels
      ),
      scale: GLOBAL_STATE.scale,
      palette: GLOBAL_STATE.yarnPalette,
      canvas: previewCanvas,
    },

    components: [
      pointerTracker({ target: previewCanvas }),
      canvasScaler(),
      paletteRenderer({ drawFunc: hexPalette }),
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
  const tiled = generateYarnPreview(
    Bimp.fromJSON(state.bitmap),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );

  preview.dispatch({
    bitmap: generateYarnPreview(
      Bimp.fromJSON(state.bitmap),
      GLOBAL_STATE.previewX,
      GLOBAL_STATE.previewY,
      GLOBAL_STATE.yarns.pixels
    ),
  });
}

function syncYarnChanges(state) {
  GLOBAL_STATE.yarns.pixels = state.bitmap.vMirror().pixels;

  const tiled = generateYarnPreview(
    Bimp.fromJSON(repeatEditor.state.bitmap),
    GLOBAL_STATE.previewX,
    GLOBAL_STATE.previewY,
    GLOBAL_STATE.yarns.pixels
  );

  preview.dispatch({
    bitmap: tiled,
  });
}

function syncScale() {
  const bbox = document
    .getElementById("pattern-container")
    .getBoundingClientRect();

  GLOBAL_STATE.previewX = Math.floor(bbox.width / GLOBAL_STATE.scale);
  GLOBAL_STATE.previewY = Math.floor(bbox.height / GLOBAL_STATE.scale);

  const scale = GLOBAL_STATE.scale;

  repeatEditor.dispatch({
    scale,
  });
  colorChangeEditor.dispatch({
    scale,
  });
  preview.dispatch({
    scale,
    bitmap: generateYarnPreview(
      Bimp.fromJSON(repeatEditor.state.bitmap),
      GLOBAL_STATE.previewX,
      GLOBAL_STATE.previewY,
      GLOBAL_STATE.yarns.pixels
    ),
  });

  // needleEditor.dispatch({
  //   scale: state.scale,
  // });
}

function generateYarnPreview(repeat, width, height, yarnChanges) {
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

  preview = buildPreview();
  repeatEditor.addEffect("bitmap", syncRepeat);
  colorChangeEditor.addEffect("bitmap", syncYarnChanges);

  colorChangeEditor.addEffect("palette", ({ palette }) => {
    GLOBAL_STATE.yarnPalette = palette;
    preview.dispatch({
      palette,
    });
  });

  preview.addEffect("pos", ({ bitmap, pos }) => {
    if (pos.x > -1 || pos.y > -1) {
      repeatEditor.dispatch({
        pos: {
          x: pos.x % repeatEditor.state.bitmap.width,
          y:
            repeatEditor.state.bitmap.height -
            ((bitmap.height - pos.y) % repeatEditor.state.bitmap.height),
        },
      });
    }
  });
  syncScale();
}

window.onload = init;
