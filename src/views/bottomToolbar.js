import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { MIN_SCALE, MAX_SCALE } from "../constants";

import { centerZoom, fitChart } from "../actions/zoomFit";

export function bottomToolbar() {
  return html`<style>
      #bottom-toolbar {
        display: flex;
        padding: 4px;
        align-items: center;
        justify-content: right;
        background-color: #282828;
      }
      #bottom-toolbar > button {
        background: none;
        padding: 0;
        color: #929292;
        border-radius: 4px;
        line-height: 0;
        height: 35px;
        width: 35px;
        font-size: large;
      }

      #bottom-toolbar > button:hover {
        background-color: #333333;
      }
    </style>
    <div id="bottom-toolbar">
      <button @click=${() => centerZoom(GLOBAL_STATE.scale - 1)}>
        <i class="fa-solid fa-magnifying-glass-minus"></i>
      </button>
      <input
        type="range"
        min=${MIN_SCALE}
        max=${MAX_SCALE}
        .value=${String(GLOBAL_STATE.scale)}
        @input=${(e) => centerZoom(Number(e.target.value))} />
      <button @click=${() => centerZoom(GLOBAL_STATE.scale + 1)}>
        <i class="fa-solid fa-magnifying-glass-plus"></i>
      </button>
      <button @click=${fitChart}>
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>`;
}
