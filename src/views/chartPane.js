import { html, svg } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";
import { Bimp } from "../lib/Bimp";
import { GLOBAL_STATE, dispatch } from "../state";

import { polygonBbox, computeDraftMask } from "../chart/helpers";
import { scanlineFill } from "../chart/scanline";

import { chartPointerDown } from "../interaction/chartInteraction";
import { pan, zoom, fitDraft } from "../interaction/chartPanZoom";
import { yarnPanel } from "./yarnPanel";

let svgRef = createRef();

const HANDLE_RADIUS = 8;
const HANDLE_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;

function shapingToolbar() {
  return html`<div class="tool-picker">
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "hand" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "hand")}>
      <i class="fa-solid fa-hand"></i>
    </button>
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "line" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "line")}>
      <i class="fa-solid fa-draw-polygon"></i>
    </button>
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "direct" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "direct")}>
      <i class="fa-solid fa-arrow-pointer"></i>
    </button>
    <button class="btn icon" @click=${(e) => fitDraft(svgRef.value)}>
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>`;
}

function draftPath() {
  let pts = GLOBAL_STATE.boundary;
  let scale = GLOBAL_STATE.scale;
  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    geom.push(
      svg`<line
      class="draft-line"
      data-index="${i}"
      stroke-width=${PATH_STROKE_WIDTH / scale}
      x1=${pts[i][0]}
      y1=${pts[i][1]}
      x2=${pts[(i + 1) % numPts][0]}
      y2=${pts[(i + 1) % numPts][1]}>`
    );
  }

  for (let i = 0; i < numPts; i++) {
    geom.push(
      svg`<circle
      class="handle"
      data-index="${i}"
      cx="${pts[i][0]}"
      cy="${pts[i][1]}"
      stroke-width="${HANDLE_STROKE_WIDTH / scale}"
      r="${HANDLE_RADIUS / scale}" />`
    );
  }

  return geom;
}

function patternDefs() {
  const cellX = GLOBAL_STATE.scale / GLOBAL_STATE.stitchGauge;
  const cellY = GLOBAL_STATE.scale / GLOBAL_STATE.rowGauge;
  const tick = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  return svg`
    <defs>
      <pattern
        id="grid"
        width="${cellX}"
        height="${cellY}"
        patternUnits="userSpaceOnUse">
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="${cellX}" y2="0"></line>
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="0" y2="${cellY}"></line>
      </pattern>
    </defs>`;
}

export function chartPaneView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapingMask;
  const bbox = polygonBbox(GLOBAL_STATE.boundary);

  const chartWidth = Math.round(
    (scale * chart.width) / GLOBAL_STATE.stitchGauge
  );
  const chartHeight = Math.round(
    (scale * chart.height) / GLOBAL_STATE.rowGauge
  );

  const chartX = Math.round(x + bbox.xMin * scale);
  const chartY = Math.round(y + bbox.yMin * scale);

  const cellHeight = scale / GLOBAL_STATE.rowGauge;

  return html`
    ${shapingToolbar()} ${yarnPanel(chartY, chartHeight)}
    <div class="desktop">
      <div
        style="position: absolute; bottom: 0; left: 0;
      transform: translate(${chartX}px, ${-chartY}px);
      outline: 1px solid black;">
        <canvas id="chart-canvas"></canvas>
      </div>
      <svg
        class="desktop-svg"
        style="position: absolute; top: 0px; left: 0px; overflow: hidden;"
        width="100%"
        height="100%"
        ${ref(svgRef)}
        ${ref(init)}
        @pointerdown=${chartPointerDown}
        @wheel=${zoom}>
        ${patternDefs()}
        <g transform="scale (1, -1)" transform-origin="center">
          ${cellHeight < 10
            ? ""
            : svg`<rect
            transform="translate(${chartX} ${chartY})"
            width=${chartWidth}
            height=${chartHeight}
            fill="url(#grid)"></rect>`}

          <g transform="translate(${x} ${y})">
            <g transform="scale(${scale})">${draftPath()}</g>
          </g>
        </g>
      </svg>
    </div>
  `;
}

function init() {
  if (!svgRef.value) return;
  setTimeout(() => fitDraft(svgRef.value));
  let chart = computeDraftMask(GLOBAL_STATE.boundary);
  dispatch({
    shapingMask: chart,
    yarnSequence: Array.from({ length: chart.height }, () => [0]),
  });
}
