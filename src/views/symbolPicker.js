import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";

export function symbolPicker() {
  return html`<div id="symbol-picker">
    ${GLOBAL_STATE.symbolMap.map(
      (symbolName, index) => html`<button
        class="btn img ${GLOBAL_STATE.activeSymbol == index ? "current" : ""}"
        @click=${() => dispatch({ activeSymbol: index })}>
        <img
          class="symbol-img"
          style="background-color: ${GLOBAL_STATE.chartBackground};"
          src=${GLOBAL_STATE.symbolPalette[symbolName]
            ? GLOBAL_STATE.symbolPalette[symbolName].src
            : ""} />
      </button>`
    )}
  </div>`;
}
