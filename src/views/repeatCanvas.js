import { dispatch, GLOBAL_STATE } from "../state";
import { html } from "lit-html";

export function repeatCanvas() {
  return html` <div id="repeat-container">
    ${GLOBAL_STATE.repeats.map(
      (repeat, index) =>
        html`<div
          class="repeat-canvas-container"
          id="repeat-${index}-container">
          <div class="repeat-ui">
            <button class="btn icon solid resize-repeat-y grab">
              <i class="fa-solid fa-up-down"></i>
            </button>
            <button
              class="delete-repeat-button btn icon solid"
              @click=${() =>
                dispatch({
                  repeats: [
                    ...GLOBAL_STATE.repeats.slice(0, index),
                    ...GLOBAL_STATE.repeats.slice(index + 1),
                  ],
                })}>
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
            <button class="btn icon solid move-repeat-grabber">
              <i class="fa-solid fa-up-down-left-right"></i>
            </button>
          </div>
          <button class="btn icon solid resize-repeat-x grab">
            <i class="fa-solid fa-left-right"></i>
          </button>

          <canvas
            data-repeatindex=${index}
            id="repeat-${index}"
            class="repeat-canvas"></canvas>
        </div>`
    )}
  </div>`;
}
