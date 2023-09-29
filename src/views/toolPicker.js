import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { tools } from "../constants";

export function toolPicker() {
  return html`<div id="tool-picker">
    ${Object.entries(tools).map(
      ([toolId, toolData]) => html`<button
        class="btn icon ${GLOBAL_STATE.activeTool == toolId ? "current" : ""}"
        @click=${() => dispatch({ activeTool: toolId })}>
        <i class=${toolData.icon}></i>
      </button>`
    )}
  </div>`;
}
