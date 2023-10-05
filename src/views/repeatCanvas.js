import { dispatch, GLOBAL_STATE } from "../state";
import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { toolData } from "../constants";
import { repeatEditingTools } from "../actions/repeatEditingTools";

function repeatUI(repeat, index) {
  return html`
    <div class="repeat-ui repeat-controls">
      <button
        class="btn solid delete-repeat"
        @click=${() =>
          dispatch({
            editingRepeat: -1,
            repeats: [
              ...GLOBAL_STATE.repeats.slice(0, index),
              ...GLOBAL_STATE.repeats.slice(index + 1),
            ],
          })}>
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
      <button class="btn solid move-repeat">
        <i class="fa-solid fa-grip"></i>
      </button>
      <button class="btn solid resize-repeat">
        <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
      </button>
    </div>
    <div class="repeat-ui repeat-tool-picker">
      ${Object.keys(repeatEditingTools).map(
        (toolName) => html`<button
          class="btn solid ${GLOBAL_STATE.activeTool == toolName
            ? "current"
            : ""}"
          @click=${() =>
            dispatch({
              activeTool: toolName,
            })}>
          <i class=${toolData[toolName].icon}></i>
        </button>`
      )}
    </div>
  `;
}

function xPos(repeat) {
  return Math.floor((repeat.pos[0] * GLOBAL_STATE.scale) / devicePixelRatio);
}

function yPos(repeat) {
  return Math.floor(
    ((GLOBAL_STATE.chart.height - repeat.bitmap.height - repeat.pos[1]) *
      GLOBAL_STATE.scale) /
      devicePixelRatio
  );
}

export function repeatCanvas() {
  return html` <div id="repeat-container">
    ${GLOBAL_STATE.repeats.map(
      (repeat, index) =>
        html`<div
          data-repeatindex=${index}
          class="repeat-canvas-container"
          style="transform: translate(${xPos(repeat)}px, ${yPos(repeat)}px)"
          id="repeat-${index}-container">
          ${when(GLOBAL_STATE.editingRepeat == index, () =>
            repeatUI(repeat, index)
          )}
          <canvas id="repeat-${index}" class="repeat-canvas"></canvas>
          <canvas id="repeat-${index}-grid" class="grid-canvas"></canvas>
          <canvas id="repeat-${index}-outline" class="outline-canvas"></canvas>
        </div>`
    )}
  </div>`;
}
