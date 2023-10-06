import { html } from "lit-html";
import { dispatch, GLOBAL_STATE } from "../state";

export function repeatLibrary() {
  return html`<div id="repeat-library">
    <h2>
      Repeat Library
      <button
        id="repeat-library-button"
        class="btn icon solid"
        @click=${() =>
          dispatch({
            showRepeatLibrary: !GLOBAL_STATE.showRepeatLibrary,
          })}>
        <i
          class="fa-solid ${GLOBAL_STATE.showRepeatLibrary
            ? "fa-angle-down"
            : "fa-angle-up"}"></i>
      </button>
    </h2>
    <div
      id="repeat-library-content"
      class="scroller ${GLOBAL_STATE.showRepeatLibrary ? "open" : "closed"}">
      ${GLOBAL_STATE.repeatLibrary.map(
        (repeat, index) => html`
          <div class="repeat-library-canvas">
            <canvas
              data-repeattitle=${repeat.title}
              draggable="true"
              data-repeatlibraryindex=${index}></canvas>
          </div>
          <div class="repeat-size">
            ${repeat.bitmap.width}x${repeat.bitmap.height}
          </div>
          <div class="repeat-title">${repeat.title}</div>
        `
      )}
    </div>
  </div>`;
}
