import { html } from "lit-html";
import { GLOBAL_STATE, dispatch, undo } from "../state";
import { MIN_SCALE, MAX_SCALE } from "../constants";
import { centerZoom, fitChart } from "../actions/zoomFit";

function updateChartWidth(newWidth) {
  dispatch({
    chart: GLOBAL_STATE.chart.resize(newWidth, GLOBAL_STATE.chart.height),
  });

  fitChart();
}

function updateChartHeight(newHeight) {
  dispatch({
    chart: GLOBAL_STATE.chart.resize(GLOBAL_STATE.chart.width, newHeight),
  });

  fitChart();
}

export function bottomToolbar() {
  return html`<div id="bottom-toolbar">
    <button class="btn icon" @click=${() => undo()}>
      <i class="fa-solid fa-rotate-left"></i>
    </button>

    <span id="cursor-position">
      [${GLOBAL_STATE.pos.x}, ${GLOBAL_STATE.pos.y}]
    </span>

    <div id="chart-size-controls">
      <label>Width</label>
      <input
        class="input"
        type="number"
        value=${GLOBAL_STATE.chart.width}
        @change=${(e) => updateChartWidth(Number(e.target.value))}
        min="5"
        max="1000" />
      <label>Height</label>
      <input
        class="input"
        type="number"
        value=${GLOBAL_STATE.chart.height}
        @change=${(e) => updateChartHeight(Number(e.target.value))}
        min="5"
        max="1000" />
    </div>

    <div id="panzoom-controls">
      <button
        class="btn icon"
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
        class="btn icon"
        @click=${() => centerZoom(GLOBAL_STATE.scale + 1)}>
        <i class="fa-solid fa-magnifying-glass-plus"></i>
      </button>
      <button class="btn icon" @click=${fitChart}>
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>
  </div>`;
}
