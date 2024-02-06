import { html, svg } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";
import { GLOBAL_STATE, dispatch } from "../state";

import { polygonBbox, computeDraftMask } from "../chart/helpers";

import {
  chartContextMenu,
  chartPointerDown,
} from "../interaction/chartInteraction";
import { zoom, fitDraft } from "../interaction/chartPanZoom";
import { yarnPanel } from "./yarnPanel";
import { shapingPaths, pathAnnotations } from "./shapingPaths";
import { currentTargetPointerPos } from "../utilities/misc";

let svgRef = createRef();

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

const gridPattern = (cellWidth, cellHeight) => svg`
      <pattern
        id="grid"
        width="${cellWidth}"
        height="${cellHeight}"
        patternUnits="userSpaceOnUse">
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="${cellWidth}" y2="0"></line>
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="0" y2="${cellHeight}"></line>
      </pattern>`;

export function chartPaneView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapingMask;
  const bbox = polygonBbox(GLOBAL_STATE.boundary);
  const { stitchGauge, rowGauge } = GLOBAL_STATE;

  const chartWidth = Math.round((scale * chart.width) / stitchGauge);
  const chartHeight = Math.round((scale * chart.height) / rowGauge);

  const chartX = Math.round(x + bbox.xMin * scale);
  const chartY = Math.round(y + bbox.yMin * scale);

  const cellWidth = scale / stitchGauge;
  const cellHeight = scale / rowGauge;

  let pointerX = Math.floor(
    (GLOBAL_STATE.desktopPointerPos[0] - chartX) / cellWidth
  );
  let pointerY = Math.floor(
    (GLOBAL_STATE.desktopPointerPos[1] - chartY) / cellHeight
  );

  return html`
    ${shapingToolbar()} ${yarnPanel(chartY, chartHeight)}
    <div
      class="desktop"
      @pointermove=${(e) =>
        (GLOBAL_STATE.desktopPointerPos = currentTargetPointerPos(e))}>
      <span class="pointer-pos">[${pointerX},${pointerY}]</span>
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
        @contextmenu=${chartContextMenu}
        @wheel=${zoom}>
        <defs>${gridPattern(cellWidth, cellHeight)}</defs>
        <g transform="scale (1, -1)" transform-origin="center">
          <g
            transform="translate(${chartX} ${chartY})"
            width=${chartWidth}
            height=${chartHeight}>
            ${cellHeight < 10
              ? ""
              : svg`<rect

            width=${chartWidth}
            height=${chartHeight}
            fill="url(#grid)"></rect>`}
            <rect
              class="pointer-highlight"
              transform="translate(${pointerX * cellWidth + 1} ${pointerY *
                cellHeight +
              1})"
              width=${cellWidth - 1}
              height=${cellHeight - 1}></rect>
          </g>
          <g transform="translate(${x} ${y})">
            <g transform="scale(${scale})">${shapingPaths()}</g>
          </g>
        </g>
      </svg>
      <div
        style="position: absolute; bottom: 0; left: 0;
      transform: translate(${chartX}px, ${-chartY}px);">
        ${pathAnnotations()}
      </div>
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
