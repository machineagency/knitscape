import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { fitChart, centerZoom } from "../interaction/chartPanZoom";

function setInteractionMode(mode) {
  dispatch(
    {
      interactionMode: mode,
      stitchSelect: null,
      selectedBlock: null,
      selectedBoundary: null,
      selectedPath: null,
      blockEditMode: null,
    },
    true
  );
}

export function bottomBar() {
  const { pointer, colorMode, interactionMode, scale } = GLOBAL_STATE;
  return html`<div class="chart-bottom-bar">
    <div class="radio-group">
      <button
        class="${colorMode == "operation" ? "selected" : ""}"
        @click=${() => dispatch({ colorMode: "operation" })}>
        command view
      </button>
      <button
        class="${colorMode == "yarn" ? "selected" : ""}"
        @click=${() => dispatch({ colorMode: "yarn" })}>
        yarn view
      </button>
    </div>

    <div class="radio-group">
      <button
        class="${interactionMode == "boundary" ? "selected" : ""}"
        @click=${() => setInteractionMode("boundary")}>
        boundaries
      </button>
      <button
        class="${interactionMode == "path" ? "selected" : ""}"
        @click=${() => setInteractionMode("path")}>
        paths
      </button>
      <button
        class="${interactionMode == "block" ? "selected" : ""}"
        @click=${() => setInteractionMode("block")}>
        blocks
      </button>
    </div>
    <div class="h-group">
      <div class="pointer-pos">
        <div><span>col</span> <span>${pointer[0] + 1}</span></div>
        <div><span>row</span> <span>${pointer[1] + 1}</span></div>
      </div>
      <div class="chart-scale">
        <input
          class="input"
          type="number"
          min="2"
          max="200"
          step="1"
          .value=${String(scale)}
          @change=${(e) => centerZoom(Number(e.target.value))} />
        <div class="spinners">
          <button @click=${() => centerZoom(scale + 1)}>
            <i class="fa-solid fa-angle-up fa-xs"></i>
          </button>
          <button @click=${() => centerZoom(scale - 1)}>
            <i class="fa-solid fa-angle-down fa-xs"></i>
          </button>
        </div>
      </div>
      <button class="btn" @click=${fitChart}>
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>
  </div>`;
}
