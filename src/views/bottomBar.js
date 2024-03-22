import { html, svg } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { zoom, fitChart, centerZoom } from "../interaction/chartPanZoom";

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
    <button
      class="btn solid mode-toggle"
      @click=${() =>
        dispatch({
          colorMode: colorMode == "operation" ? "yarn" : "operation",
        })}>
      ${colorMode == "operation" ? "command view" : "yarn view"}
    </button>

    <div class="h-group">
      <button
        class="btn ${interactionMode == "boundary" ? "solid" : ""}"
        @click=${() => setInteractionMode("boundary")}>
        boundaries
      </button>
      <button
        class="btn ${interactionMode == "path" ? "solid" : ""}"
        @click=${() => setInteractionMode("path")}>
        paths
      </button>
      <button
        class="btn ${interactionMode == "block" ? "solid" : ""}"
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
