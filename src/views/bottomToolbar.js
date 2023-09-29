import { html } from "lit-html";
import { GLOBAL_STATE, dispatch, undo } from "../state";
import { MIN_SCALE, MAX_SCALE } from "../constants";
import { centerZoom, fitChart } from "../actions/zoomFit";

export function bottomToolbar() {
  return html`<style>
      #bottom-toolbar {
        display: flex;
        padding: 4px;
        align-items: center;
        justify-content: space-between;
        background-color: #212121;
        box-shadow: 0 0 5px 0px black;
      }

      .ctrl-btn {
        background: none;
        padding: 0;
        color: #929292;
        border-radius: 4px;
        line-height: 0;
        height: 35px;
        width: 35px;
        font-size: large;
      }

      .ctrl-btn:hover {
        background-color: #333333;
      }

      #panzoom-controls {
        display: flex;
        align-items: center;
      }
    </style>
    <div id="bottom-toolbar">
      <button class="ctrl-btn" @click=${() => undo()}>
        <i class="fa-solid fa-rotate-left"></i>
      </button>

      <div id="panzoom-controls">
        <button
          class="ctrl-btn"
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
          class="ctrl-btn"
          @click=${() => centerZoom(GLOBAL_STATE.scale + 1)}>
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>
        <button class="ctrl-btn" @click=${fitChart}>
          <i class="fa-solid fa-expand"></i>
        </button>
      </div>
    </div>`;
}
