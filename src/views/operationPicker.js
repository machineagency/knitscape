import { html } from "lit-html";
import { dispatch, GLOBAL_STATE } from "../state";

export function operationPicker() {
  return html`<div class="chart-bottom-bar">
    <div class="operation-picker scroller">
      ${GLOBAL_STATE.symbolMap.map(
        (symbolName, index) => html`<button
          class="btn solid img ${GLOBAL_STATE.activeSymbol == index
            ? "current"
            : ""}"
          @click=${() => dispatch({ activeSymbol: index })}>
          <canvas class="symbol-preview" data-symbol=${symbolName}></canvas>
        </button>`
      )}
    </div>
  </div>`;
}

export function yarnColorPicker() {
  return html`<div class="chart-bottom-bar">
    <label class="color-mode-toggle switch">
      <input
        type="checkbox"
        checked
        @change=${(e) =>
          dispatch({ colorMode: e.target.checked ? "operation" : "yarn" })} />
      <span class="slider round"></span>
    </label>
    <div class="operation-picker scroller">
      ${GLOBAL_STATE.symbolMap.map(
        (symbolName, index) => html`<button
          class="btn solid img ${GLOBAL_STATE.activeSymbol == index
            ? "current"
            : ""}"
          @click=${() => dispatch({ activeSymbol: index })}>
          <canvas class="symbol-preview" data-symbol=${symbolName}></canvas>
        </button>`
      )}
    </div>
  </div>`;
}
