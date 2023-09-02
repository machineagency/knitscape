import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

import { BimpEditor } from "./bitmapEditor/BimpEditor";
import { Bimp } from "./bitmapEditor/Bimp";

import { pointerTracker } from "./bitmapEditor/pointerTracker";
import { grid } from "./bitmapEditor/grid";
import { canvasScaler } from "./bitmapEditor/canvasScaler";
import { paletteRenderer } from "./bitmapEditor/paletteRenderer";
import { hexPalette } from "./bitmapEditor/palettes";
import { pointerEvents } from "./bitmapEditor/pointerEvents";
import { brush } from "./bitmapEditor/tools";
import { stateHook } from "./bitmapEditor/stateHook";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function hexPaletteSelect(container) {
  return (state, dispatch) =>
    render(
      html`
        <button
          style="aspect-ratio: 1;"
          @click=${() => {
            let newPalette = [...state.palette];
            newPalette.push(getRandomColor());
            dispatch({ palette: newPalette });
          }}>
          <i class="fa-solid fa-plus"></i>
        </button>

        <div class="palette-select">
          ${state.palette.map(
            (hex, index) =>
              html`<div
                style="background-color: ${hex}"
                class="hex-select ${index == state.paletteIndex
                  ? "selected"
                  : ""}"
                @click=${() => dispatch({ paletteIndex: index })}>
                <label class="edit-color" for="color-${index}">
                  <i class="fa-solid fa-pen"></i>
                </label>
                <input
                  id="color-${index}"
                  type="color"
                  value="${hex}"
                  @input=${(e) => {
                    let newPalette = [...state.palette];
                    newPalette[index] = e.target.value;
                    dispatch({ palette: newPalette });
                  }} />
              </div>`
          )}
        </div>

        <button
          style="aspect-ratio: 1;"
          @click=${() => {
            dispatch({
              palette: Array.from(Array(state.palette.length), () =>
                getRandomColor()
              ),
            });
          }}>
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
      `,
      container
    );
}

function yarnHeightSpinner({ container }) {
  return (state, dispatch) => {
    let { bitmap } = state;
    render(
      html`<div class="spinner vertical">
        <button
          class="plus"
          @click=${() =>
            dispatch({
              bitmap: bitmap
                .vMirror()
                .resize(bitmap.width, bitmap.height + 1)
                .vMirror(),
            })}>
          <i class="fa-solid fa-plus"></i>
        </button>
        <input
          type="text"
          .value=${live(bitmap.height)}
          class="size-input"
          @change=${(e) =>
            dispatch({
              bitmap: bitmap
                .vMirror()
                .resize(bitmap.width, Number(e.target.value))
                .vMirror(),
            })} />

        <button
          class="minus"
          @click=${() =>
            dispatch({
              bitmap: bitmap
                .vMirror()
                .resize(bitmap.width, bitmap.height - 1)
                .vMirror(),
            })}>
          <i class="fa-solid fa-minus"></i>
        </button>
      </div>`,
      container
    );
  };
}

export function buildColorChangeEditor(state, canvas) {
  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(state.yarns).vMirror(),
      palette: state.yarnPalette,
      canvas: canvas,
    },

    components: [
      pointerTracker({ target: canvas }),
      canvasScaler(),
      paletteRenderer({
        drawFunc: hexPalette,
      }),
      grid(),
      pointerEvents({
        tools: { brush },
        eventTarget: canvas,
      }),
      stateHook({
        cb: yarnHeightSpinner({
          container: document.getElementById("color-height"),
        }),
      }),
      stateHook({
        cb: hexPaletteSelect(document.getElementById("yarn-palette")),
      }),
    ],
  });
}
