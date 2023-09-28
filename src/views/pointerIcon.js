import { html } from "lit-html";
import { GLOBAL_STATE } from "../state";

const iconMap = {
  flood: "fa-fill-drip fa-flip-horizontal",
  brush: "fa-paintbrush",
  rect: "fa-vector-square",
  line: "fa-minus",
  // shift: "fa-up-down-left-right",
  eyedropper: "fa-eyedropper",
  pan: "fa-up-down-left-right",
};

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
      <i class="fa-solid ${iconMap[GLOBAL_STATE.activeTool]}"></i>
    </div>`;
}
