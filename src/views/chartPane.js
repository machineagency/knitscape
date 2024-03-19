import { html, svg } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE, dispatch } from "../state";

import {
  chartContextMenu,
  chartPointerDown,
  chartClick,
} from "../interaction/chartInteraction";
import { zoom, fitChart } from "../interaction/chartPanZoom";

import {
  boundaryMenu,
  boundaryView,
  activeBoundaryPath,
  boundaryBlocks,
} from "./annotations/boundaries";
import {
  stitchBlocks,
  stitchSelectBox,
  stitchBlockToolbar,
} from "./annotations/blocks";

import { currentTargetPointerPos } from "../utilities/misc";

import { gridPattern, cellShadow, activeBoundaryMask } from "./defs";
import { palettes } from "./palettes";

function toolbar() {
  const { interactionMode, colorMode } = GLOBAL_STATE;
  return html`<div class="tool-picker">
    <label class="color-mode-toggle switch">
      <input
        type="checkbox"
        ?checked=${colorMode == "operation"}
        @change=${(e) =>
          dispatch({
            colorMode: e.target.checked ? "operation" : "yarn",
          })} />
      <span class="slider round"></span>
    </label>
    <button
      class="btn solid ${interactionMode == "pan" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.interactionMode = "pan")}>
      <i class="fa-solid fa-hand"></i>
    </button>
    <button
      class="btn solid ${interactionMode == "path" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.interactionMode = "path")}>
      <i class="fa-solid fa-minus"></i>
    </button>
    <button
      class="btn solid ${interactionMode == "boundary" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.interactionMode = "boundary")}>
      <i class="fa-solid fa-vector-square"></i>
    </button>
    <button
      class="btn solid ${interactionMode == "block" ? "current" : ""}"
      @click=${() => (GLOBAL_STATE.interactionMode = "block")}>
      <i class="fa-solid fa-table-cells"></i>
    </button>
    <button
      class="btn icon"
      @click=${() => fitChart(document.getElementById("svg-layer"))}>
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>`;
}

function contextToolbar() {
  if (GLOBAL_STATE.editingBlock != null) {
    return stitchBlockToolbar();
  } else {
    return toolbar();
  }
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
    <div class="desktop" @pointermove=${(e) => trackPointer(e)}>
      ${contextToolbar()}
      <span class="pointer-pos">[${pointer[0]},${pointer[1]}]</span>
      <div
        style="position: absolute; bottom: 0; left: 0; transform: translate(${chartPan.x}px,${-chartPan.y}px);">
        <canvas
          style="transform: translate(${offsetX}px,${-offsetY}px); outline: 1px solid black; filter: ${editingBlock
            ? "grayscale(1)"
            : "none"}"
          id="chart-canvas"></canvas>
      </div>
      <svg
        id="svg-layer"
        preserveAspectRatio="xMidYMid meet"
        class="desktop-svg ${transforming ? "transforming" : "allow-hover"}"
        style="position: absolute;"
        width="100%"
        height="100%"
        @pointerdown=${chartPointerDown}
        @contextmenu=${chartContextMenu}
        @click=${chartClick}
        @wheel=${zoom}>
        <!-- <defs>${gridPattern(
          cellWidth,
          cellHeight
        )} ${cellShadow()}</defs> -->

        <g transform="scale (1, -1)" transform-origin="center">
          <g transform="translate(${chartPan.x} ${chartPan.y})">
            ${boundaryView()}
          </g>
        </g>
      </svg>
      <div
        style="position: absolute; bottom: 0; left: 0;
      transform: translate(${chartPan.x}px, ${-chartPan.y}px); ">
        ${when(
          GLOBAL_STATE.interactionMode == "boundary" &&
            GLOBAL_STATE.selectedBoundary != null,
          boundaryBlocks
        )}
        ${when(GLOBAL_STATE.stitchSelect, stitchSelectBox)} ${stitchBlocks()}
      </div>
      <svg
        preserveAspectRatio="xMidYMid meet"
        class="desktop-svg vector-overlay ${transforming
          ? "transforming"
          : "allow-hover"}"
        style="position: absolute;"
        width="100%"
        height="100%"
        @pointerdown=${chartPointerDown}
        @contextmenu=${chartContextMenu}
        @click=${chartClick}
        @wheel=${zoom}>
        <defs>${gridPattern(cellWidth, cellHeight)} ${cellShadow()}</defs>

        <g transform="scale (1, -1)" transform-origin="center">
          <g transform="translate(${chartPan.x} ${chartPan.y})">
            <g transform="translate(${offsetX} ${offsetY})">
              ${cellHeight > 10
                ? svg`
              <rect

                width=${w}
                height=${h}
                fill="url(#grid)">
              </rect>`
                : ""}

              <rect
                width=${w}
                height=${h}
                fill=${editingBlock ? "#00000033" : "transparent"}></rect>
              ${pointerCellHighlight()}
            </g>
            ${activeBoundaryPath()} ${activeBoundaryMask()}
          </g>
        </g>
      </svg>
      ${palettes()} ${boundaryMenu()}
    </div>
  `;
}
