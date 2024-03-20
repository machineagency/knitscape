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
      <div id="sim-container">
        <div
          id="canvas-container"
          style="transform: translate(${x}px, ${y}px)"
          class=${GLOBAL_STATE.flipped ? "mirrored" : ""}></div>
      </div>
      ${simToolbar()}
    </div>
  `;
}

function simToolbar() {
  const { simScale, flipped, relax, simLive } = GLOBAL_STATE;
  return html` <div id="sim-controls" class="panzoom-controls">
    <label class="form-control toggle">
      Live
      <input
        type="checkbox"
        ?checked=${simLive}
        @change=${() => dispatch({ simLive: !simLive })} />
    </label>
    <button @click=${drawYarns} ?disabled=${simLive} class="btn solid">
      refresh
    </button>
    <button @click=${relax} class="btn solid">relax</button>
    <button @click=${() => dispatch({ flipped: !flipped })} class="btn solid">
      flip
    </button>
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
  </div>`;
}
