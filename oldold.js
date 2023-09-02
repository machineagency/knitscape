import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

import { Bimp } from "./bitmapEditor/Bimp";
import { BimpEditor } from "./bitmapEditor/BimpEditor";
import { fieldMonitor } from "./bitmapEditor/stateFieldMonitor";
import { scaledCanvas } from "./bitmapEditor/scaledCanvas";
import { pixelPerfectCanvas } from "./bitmapEditor/pixelPerfectCanvas";
import { pointerTracker } from "./bitmapEditor/pointerTracker";
import { grid } from "./bitmapEditor/grid";
import { highlight } from "./bitmapEditor/highlight";

import { numberGutter } from "./bitmapEditor/numberGutter";
import { colorNumberGutter } from "./bitmapEditor/colorNumberGutter";

import { paletteRenderer } from "./bitmapEditor/paletteRenderer";
import { hexPalette, imagePalette } from "./bitmapEditor/palettes";

import { pointerEvents } from "./bitmapEditor/pointerEvents";
import { brush, flood, line, rect, shift, pan } from "./bitmapEditor/tools";
import { stateHook } from "./bitmapEditor/stateHook";
import { heightControl, controlPanel } from "./bitmapEditor/controlPanel";

import startState from "./startState.json";

import knitUrl from "./stitchSymbols/knit.png";
import slipUrl from "./stitchSymbols/slip.png";
import tuckUrl from "./stitchSymbols/tuck.png";
import purlUrl from "./stitchSymbols/purl.png";

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

function repeatEditorView() {
  return html`<div id="repeat-editor-container" style="grid-area: repeat;">
    <div id="repeat-controls" style="grid-area: controls;">
      <div id="repeat-tools"></div>
      <div id="repeat-palette"></div>
      <div id="repeat-height"></div>
    </div>

    <div id="repeat-gutter-v" style="grid-area: vgutter;"></div>
    <div id="repeat-container" style="grid-area: repeat;">
      <canvas id="repeat-editor"></canvas>
    </div>
    <div id="repeat-gutter-h" style="grid-area: hgutter;"></div>
    <div id="repeat-controls-bottom" style="grid-area: repeatbottom;">
      <div id="repeat-width"></div>
    </div>
  </div>`;
}

function view() {
  return html`
    <div id="main-content">
      <div id="top" style="grid-area: top;"></div>
      ${repeatEditorView()}
      <div id="pattern-container" style="grid-area: pattern">
        <div id="color-change-container" style="grid-area: colors;">
          <canvas id="color-change-editor"></canvas>
        </div>
        <div id="preview-gutter-v" style="grid-area: vgutter;"></div>
        <div id="preview-container" style="grid-area: preview;">
          <canvas id="preview"></canvas>
        </div>
        <div id="preview-gutter-h" style="grid-area: hgutter;"></div>
        <div style="grid-area: needles;">
          <canvas id="needle-work-editor"></canvas>
        </div>
        <div id="preview-controls" style="grid-area: controls;"></div>
      </div>
    </div>
  `;
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
            })}></button>

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
            })}></button>
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
            })}></button>
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
            })}></button>
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
              ${tool}
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
  function measureFunc({ aspectRatio, bitmap }) {
    const bbox = document
      .getElementById("repeat-container")
      .getBoundingClientRect();

    const availableWidth = bbox.width;
    const availableHeight = bbox.height;

    return Math.min(
      Math.floor(availableWidth / (bitmap.width * aspectRatio[0])),
      Math.floor(availableHeight / (bitmap.height * aspectRatio[1]))
    );
  }
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
      scaledCanvas({ measureFunc }),

      pointerEvents({
        tools: repeatTools,
        eventTarget: repeatEditorCanvas,
      }),
      paletteRenderer({ drawFunc: imagePalette }),
      grid(),
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
          container: document.getElementById("repeat-gutter-h"),
          axis: "horizontal",
        }),
      }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.getElementById("repeat-gutter-v"),
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

function buildColorChangeEditor() {
  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(GLOBAL_STATE.yarns).vMirror(),
      palette: GLOBAL_STATE.yarnPalette,
      canvas: colorChangeEditorCanvas,
    },

    components: [
      pointerTracker({ target: colorChangeEditorCanvas }),
      scaledCanvas({}),
      paletteRenderer({
        drawFunc: hexPalette,
      }),
      pointerEvents({
        tools: { brush },
        eventTarget: colorChangeEditorCanvas,
      }),
      grid(),
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
  function measureFunc({ aspectRatio, bitmap }) {
    const bbox = document
      .getElementById("pattern-container")
      .getBoundingClientRect();

    const availableWidth = 0.8 * bbox.width;
    const availableHeight = 0.8 * bbox.height;

    return Math.min(
      Math.floor(availableWidth / (bitmap.width * aspectRatio[0])),
      Math.floor(availableHeight / (bitmap.height * aspectRatio[1]))
    );
  }

  return new BimpEditor({
    state: {
      bitmap: generateYarnPreview(
        Bimp.fromJSON(GLOBAL_STATE.repeat),
        GLOBAL_STATE.previewX,
        GLOBAL_STATE.previewY,
        GLOBAL_STATE.yarns.pixels
      ),
      palette: GLOBAL_STATE.yarnPalette,
      canvas: previewCanvas,
    },

    components: [
      pointerTracker({ target: previewCanvas }),
      scaledCanvas({ measureFunc }),
      paletteRenderer({ drawFunc: hexPalette }),
      // grid(),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.getElementById("preview-gutter-h"),
          axis: "horizontal",
        }),
      }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.getElementById("preview-gutter-v"),
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
    bitmap: tiled,
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

function syncScale(state) {
  colorChangeEditor.dispatch({
    scale: state.scale,
  });

  needleEditor.dispatch({
    scale: state.scale,
  });

  // document.getElementById("repeat-padding").style.height = `${state.scale}px`;
}

async function init() {
  render(view(), document.body);

  repeatEditorCanvas = document.getElementById("repeat-editor");
  colorChangeEditorCanvas = document.getElementById("color-change-editor");
  previewCanvas = document.getElementById("preview");
  needleEditorCanvas = document.getElementById("needle-work-editor");

  repeatEditor = await buildRepeatEditor();
  colorChangeEditor = buildColorChangeEditor();
  needleEditor = buildNeedleEditor();
  preview = buildPreview();

  repeatEditor.addComponent(
    stateHook({ check: fieldMonitor("bitmap"), cb: syncRepeat })
  );
  colorChangeEditor.addComponent(
    stateHook({ check: fieldMonitor("bitmap"), cb: syncYarnChanges })
  );

  preview.addComponent(
    stateHook({ check: fieldMonitor("scale"), cb: syncScale })
  );
}

window.onload = init;
