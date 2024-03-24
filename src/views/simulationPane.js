import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { MIN_SIM_SCALE, MAX_SIM_SCALE } from "../constants";
import {
  simPan,
  simZoom,
  centerZoomSimulation,
} from "../interaction/simPanZoom";
import { drawYarns } from "../subscribers/runSimulation";

export function simulationView() {
  let { x, y } = GLOBAL_STATE.simPan;
  return html`
    <div id="sim-pane" @pointerdown=${simPan} @wheel=${simZoom}>
      ${simActionBar()}

      <div id="sim-container">
        <div
          id="canvas-container"
          style="transform: translate(${x}px, ${y}px)"></div>
      </div>
      ${simToolbar()}
    </div>
  `;
}

function simActionBar() {
  const { relax } = GLOBAL_STATE;

  return html`<div class="sim-action-bar">
    <button @click=${drawYarns} class="btn solid">
      <i class="fa-solid fa-rotate"></i>refresh
    </button>
    <button @click=${relax} class="btn solid">
      <i class="fa-solid fa-couch"></i>
      relax
    </button>
  </div>`;
}

function simToolbar() {
  const { simScale, simLive, flipped } = GLOBAL_STATE;
  return html` <div class="sim-toolbar">
    <div class="radio-group">
      <span>view</span>
      <button
        class="${flipped ? "" : "selected"}"
        @click=${() => dispatch({ flipped: false })}>
        front
      </button>
      <button
        class="${flipped ? "selected" : ""}"
        @click=${() => dispatch({ flipped: true })}>
        back
      </button>
    </div>
    <div class="radio-group">
      <span>auto regen</span>
      <button
        class="${simLive ? "selected" : ""}"
        @click=${() => dispatch({ simLive: true })}>
        on
      </button>
      <button
        class="${simLive ? "" : "selected"}"
        @click=${() => dispatch({ simLive: false })}>
        off
      </button>
    </div>

    <div class="panzoom-controls">
      <button
        class="btn icon"
        @click=${() => centerZoomSimulation(simScale * 0.9)}>
        <i class="fa-solid fa-magnifying-glass-minus"></i>
      </button>
      <input
        type="range"
        min=${MIN_SIM_SCALE}
        max=${MAX_SIM_SCALE}
        step="0.1"
        .value=${String(simScale)}
        @input=${(e) => centerZoomSimulation(Number(e.target.value))} />
      <button
        class="btn icon"
        @click=${() => centerZoomSimulation(simScale * 1.1)}>
        <i class="fa-solid fa-magnifying-glass-plus"></i>
      </button>
      <button
        @click=${() => dispatch({ simPan: { x: 0, y: 0 }, simScale: 1 })}
        class="btn icon">
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>
  </div>`;
}
