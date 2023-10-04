import { dispatch, GLOBAL_STATE } from "../state";
import { html } from "lit-html";

export function repeatCanvas() {
  return html` <div id="repeat-container">
    ${GLOBAL_STATE.repeats.map(
      (repeat, index) =>
        html`<div
          data-repeatindex=${index}
          class="repeat-canvas-container"
          id="repeat-${index}-container">
          <div class="repeat-ui" data-repeatindex=${index}>
            <!-- <button class="btn solid">
              <i class="fa-solid fa-palette"></i>
            </button> -->
            <button class="btn solid move-repeat">
              <i class="fa-solid fa-up-down-left-right"></i>
            </button>
            <button class="btn solid resize-repeat">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
            </button>
          </div>
          <canvas id="repeat-${index}" class="repeat-canvas"></canvas>
        </div>`
    )}
  </div>`;
}

// <div class="repeat-ui">
//   <button class="btn icon solid resize-repeat-y grab">
//     <i class="fa-solid fa-up-down"></i>
//   </button>
//   <button
//     class="delete-repeat-button btn icon solid"
//     @click=${() =>
//       dispatch({
//         repeats: [
//           ...GLOBAL_STATE.repeats.slice(0, index),
//           ...GLOBAL_STATE.repeats.slice(index + 1),
//         ],
//       })}>
//     <i class="fa-solid fa-circle-xmark"></i>
//   </button>
//   <button class="btn icon solid move-repeat-grabber">
//     <i class="fa-solid fa-up-down-left-right"></i>
//   </button>
// </div>
