import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

import { BimpEditor } from "./bimp/BimpEditor";
import { Bimp } from "./bimp/Bimp";

import { pointerTracker } from "./bimp/pointerTracker";
import { grid } from "./bimp/grid";
import { canvasScaler } from "./bimp/canvasScaler";
import { paletteRenderer } from "./bimp/paletteRenderer";
import { imagePalette } from "./bimp/palettes";
import { pointerEvents } from "./bimp/pointerEvents";
import { stateHook } from "./bimp/stateHook";
import { fieldMonitor } from "./bimp/stateFieldMonitor";

import { outline } from "./bimp/outline";
import { highlight } from "./bimp/highlight";

import { brush, flood, line, rect, shift } from "./bimp/tools";

import { buildImagePalette } from "./utils";
import { gutterView, bottomLeft } from "./gutter";

const iconMap = {
  flood: "fa-fill-drip",
  brush: "fa-paintbrush",
  rect: "fa-vector-square",
  line: "fa-minus",
  shift: "fa-up-down-left-right",
};

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

export async function buildRepeatEditor(state, canvas, previewCanvas) {
  let repeatTools = { brush, flood, line, rect, shift };

  const palette = await buildImagePalette(["knit", "purl", "slip", "tuck"]);

  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(state.repeat),
      palette,
      canvas,
    },
    components: [
      pointerTracker({ target: canvas }),
      canvasScaler(),
      pointerEvents({
        tools: repeatTools,
        eventTarget: canvas,
      }),
      pointerEvents({
        tools: repeatTools,
        eventTarget: previewCanvas,
      }),
      paletteRenderer({ drawFunc: imagePalette }),
      grid(),
      highlight(),
      outline(),
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
