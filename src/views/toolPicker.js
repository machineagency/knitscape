import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { tools } from "../constants";

export function toolPicker() {
  return html`<style>
      #tool-picker {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #212121;
        gap: 4px;
        margin-top: 4px;
        padding: 4px;
        border-radius: 4px;
        box-shadow: 0 0 5px 0px black;
      }

      .toolbtn {
        padding: 0;
        background: none;
        color: #929292;
        border-radius: 4px;
        line-height: 0;
        height: 40px;
        width: 40px;
        font-size: x-large;
      }

      .toolbtn:hover {
        background-color: #333333;
      }

      .toolbtn.current {
        background-color: #3f3e3e;
        color: #b487bd;
      }
    </style>
    <div id="tool-picker">
      ${Object.entries(tools).map(
        ([toolId, toolData]) => html`<button
          class="toolbtn ${GLOBAL_STATE.activeTool == toolId ? "current" : ""}"
          @click=${() => dispatch({ activeTool: toolId })}>
          <i class=${toolData.icon}></i>
        </button>`
      )}
    </div>`;
}
