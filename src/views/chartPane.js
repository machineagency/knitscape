import { html, svg } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE } from "../state";

import {
  chartContextMenu,
  chartPointerDown,
  chartClick,
} from "../interaction/chartInteraction";
import { zoom, fitChart } from "../interaction/chartPanZoom";
import { yarnPanel } from "./yarnPanel";

import { boundaryMenu, boundaryView } from "./boundaryView";

import { annotationPaths } from "./annotationPaths";
import { currentTargetPointerPos } from "../utilities/misc";
import { stitchBlocks, stitchSelectBox } from "./stitchBlockView";
import { gridPattern, cellShadow } from "./defs";
import { operationPicker } from "./operationPicker";

let svgRef = createRef();

function toolbar() {
  return html`<div class="tool-picker">
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "hand" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "hand")}>
      <i class="fa-solid fa-hand"></i>
    </button>
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "line" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "line")}>
      <i class="fa-solid fa-minus"></i>
    </button>
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "select" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "select")}>
      <i class="fa-solid fa-vector-square"></i>
    </button>
    <button
      class="btn solid ${GLOBAL_STATE.activeTool == "pointer" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.activeTool = "pointer")}>
      <i class="fa-solid fa-arrow-pointer"></i>
    </button>
    <button class="btn icon" @click=${(e) => fitChart(svgRef.value)}>
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>`;
}

function trackPointer(e) {
  const { cellWidth, cellHeight, chartPan, bbox } = GLOBAL_STATE;
  let [x, y] = currentTargetPointerPos(e);
  GLOBAL_STATE.pointer = [
    Math.floor((x - chartPan.x) / cellWidth - bbox.xMin),
    Math.floor((y - chartPan.y) / cellHeight - bbox.yMin),
  ];
}

function pointerCellHighlight() {
  const {
    cellWidth,
    cellHeight,
    chart,
    transforming,
    pointer: [x, y],
  } = GLOBAL_STATE;

  if (transforming || x < 0 || y < 0 || x >= chart.width || y >= chart.height)
    return;

  return svg`<rect
      class="cell-highlight"
      transform="translate(${x * cellWidth + 2} ${y * cellHeight + 2})"
      filter="url(#path-shadow)"
      width=${cellWidth - 3}
      height=${cellHeight - 3}></rect>`;
}

export function chartPaneView() {
  const {
    scale,
    cellWidth,
    cellHeight,
    chartPan,
    chart,
    pointer,
    editingBlock,
    bbox,
    transforming,
  } = GLOBAL_STATE;

  const offsetX = Math.round(bbox.xMin * cellWidth);
  const offsetY = Math.round(bbox.yMin * cellHeight);

  const w = Math.round(cellWidth * chart.width);
  const h = Math.round(cellHeight * chart.height);

  return html`
    ${toolbar()} ${yarnPanel(chartPan.y + bbox.yMin * scale, h)}
    <div class="desktop" @pointermove=${(e) => trackPointer(e)}>
      <span class="pointer-pos">[${pointer[0]},${pointer[1]}]</span>
      <div
        style="position: absolute; bottom: 0; left: 0; transform: translate(${chartPan.x}px,${-chartPan.y}px);">
        <canvas
          style="transform: translate(${offsetX}px,${-offsetY}px); outline: 1px solid black;"
          id="chart-canvas"></canvas>
      </div>
      <svg
        id="svg-layer"
        class="desktop-svg ${transforming ? "transforming" : "allow-hover"}"
        style="position: absolute; top: 0px; left: 0px; overflow: hidden;"
        width="100%"
        height="100%"
        ${ref(svgRef)}
        @pointerdown=${chartPointerDown}
        @contextmenu=${chartContextMenu}
        @click=${chartClick}
        @wheel=${zoom}>
        <defs>${gridPattern(cellWidth, cellHeight)}${cellShadow()}</defs>
        <g transform="scale (1, -1)" transform-origin="center">
          <g transform="translate(${chartPan.x} ${chartPan.y})">
            <g
              transform="translate(${offsetX} ${offsetY})"
              width=${w}
              height=${h}>
              ${cellHeight < 10
                ? ""
                : svg`<rect
            width=${w}
            height=${h}
            fill="url(#grid)"></rect>`}
              <rect
                width=${w}
                height=${h}
                fill=${editingBlock ? "#00000033" : "transparent"}></rect>
              ${pointerCellHighlight()}
            </g>
            ${boundaryView()}
          </g>
        </g>
      </svg>
      <div
        style="position: absolute; bottom: 0; left: 0;
      transform: translate(${chartPan.x}px, ${-chartPan.y}px);">
        ${when(GLOBAL_STATE.stitchSelect, stitchSelectBox)} ${stitchBlocks()}
      </div>
      ${operationPicker()} ${boundaryMenu()}
    </div>
  `;
}
