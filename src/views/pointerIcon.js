import { html } from "lit-html";
import { GLOBAL_STATE } from "../state";
import { tools } from "../constants";

export function pointerIcon() {
  return html`<style>
      #pointer {
        display: none;
        position: fixed;
        left: 0;
        top: -20px;
        z-index: 100;
        text-shadow: 0px 0px 4px black;
        font-size: larger;
        pointer-events: none;
      }
    </style>
    <div id="pointer">
      <i class="fa-solid ${tools[GLOBAL_STATE.activeTool].icon}"></i>
    </div>`;
}
