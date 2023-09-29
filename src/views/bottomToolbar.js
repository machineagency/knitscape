import { html } from "lit-html";
import { GLOBAL_STATE, undo } from "../state";
import { MIN_SCALE, MAX_SCALE } from "../constants";
import { centerZoom, fitChart } from "../actions/zoomFit";

export function bottomToolbar() {
  return html`<div id="bottom-toolbar">
    <button class="btn icon" @click=${() => undo()}>
      <i class="fa-solid fa-rotate-left"></i>
    </button>

    <div id="panzoom-controls">
      <button
        class="btn icon"
        @click=${() => centerZoom(GLOBAL_STATE.scale - 1)}>
        <i class="fa-solid fa-magnifying-glass-minus"></i>
      </button>
      <input
        type="range"
        min=${MIN_SCALE}
        max=${MAX_SCALE}
        .value=${String(GLOBAL_STATE.scale)}
        @input=${(e) => centerZoom(Number(e.target.value))} />
      <button
        class="btn icon"
        @click=${() => centerZoom(GLOBAL_STATE.scale + 1)}>
        <i class="fa-solid fa-magnifying-glass-plus"></i>
      </button>
      <button class="btn icon" @click=${fitChart}>
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>
  </div>`;
}
