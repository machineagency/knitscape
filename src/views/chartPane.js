import { html, svg } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { classMap } from "lit-html/directives/class-map.js";

import { GLOBAL_STATE, dispatch } from "../state";

import {
  chartContextMenu,
  chartPointerDown,
} from "../interaction/chartInteraction";
import { zoom, fitChart } from "../interaction/chartPanZoom";

import {
  boundaryView,
  activeBoundaryPath,
  boundaryBlocks,
} from "./annotations/boundaries";
import { blocks, stitchSelectBox, blockToolbar } from "./annotations/blocks";

import { currentTargetPointerPos } from "../utilities/misc";

import { gridPattern, cellShadow, activeBoundaryMask } from "./defs";
import { palettes } from "./palettes";

function setInteractionMode(mode) {
  dispatch(
    {
      interactionMode: mode,
      stitchSelect: null,
      selectedBlock: null,
      selectedBoundary: null,
    },
    true
  );
}

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
      @click=${() => setInteractionMode("pan")}>
      <i class="fa-solid fa-hand"></i>
    </button>
    <button
      class="btn solid ${interactionMode == "boundary" ? "current" : ""}"
      @click=${() => setInteractionMode("boundary")}>
      <i class="fa-solid fa-vector-square"></i>
    </button>
    <button
      class="btn solid ${interactionMode == "path" ? "current" : ""}"
      @click=${() => setInteractionMode("path")}>
      <i class="fa-solid fa-minus"></i>
    </button>
    <button
      class="btn solid ${interactionMode == "block" ? "current" : ""}"
      @click=${() => setInteractionMode("block")}>
      <i class="fa-solid fa-table-cells"></i>
    </button>
    <button
      class="btn icon"
      @click=${() => fitChart(document.getElementById("svg-layer"))}>
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
    boundaries,
    selectedBoundary,
    cellWidth,
    cellHeight,
    chartPan,
    chart,
    pointer,
    selectedBlock,
    bbox,
    transforming,
    interactionMode,
  } = GLOBAL_STATE;

  const offsetX = Math.round(bbox.xMin * cellWidth);
  const offsetY = Math.round(bbox.yMin * cellHeight);

  const w = Math.round(cellWidth * chart.width);
  const h = Math.round(cellHeight * chart.height);

  const classes = {
    allowHover: !transforming && interactionMode == "boundary",
  };

  return html`
    <div class="desktop" @pointermove=${(e) => trackPointer(e)} @wheel=${zoom}>
      ${toolbar()}
      <span class="pointer-pos">[${pointer[0]},${pointer[1]}]</span>
      <div
        style="position: absolute; bottom: 0; left: 0; transform: translate(${chartPan.x}px,${-chartPan.y}px);">
        <canvas
          style="transform: translate(${offsetX}px,${-offsetY}px); outline: 1px solid black; filter: ${interactionMode ==
          "block"
            ? "grayscale(0.5)"
            : "none"}"
          id="chart-canvas"></canvas>
      </div>
      <svg
        id="svg-layer"
        preserveAspectRatio="xMidYMid meet"
        class="desktop-svg  ${classMap(classes)}"
        style="position: absolute;"
        width="100%"
        height="100%"
        @pointerdown=${chartPointerDown}
        @contextmenu=${chartContextMenu}>
        <defs>${gridPattern(cellWidth, cellHeight)}</defs>

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
            </g>
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
        ${when(GLOBAL_STATE.stitchSelect, stitchSelectBox)}
        ${when(GLOBAL_STATE.interactionMode == "block", blocks)}
      </div>
      <svg
        preserveAspectRatio="xMidYMid meet"
        class="desktop-svg vector-overlay"
        style="position: absolute;"
        width="100%"
        height="100%"
        @pointerdown=${chartPointerDown}
        @contextmenu=${chartContextMenu}
        @wheel=${zoom}>
        <defs>${cellShadow()}</defs>
        ${selectedBoundary != null
          ? activeBoundaryMask(
              boundaries[selectedBoundary],
              chartPan,
              cellWidth,
              cellHeight
            )
          : ""}
        <g transform="scale (1, -1)" transform-origin="center">
          <g transform="translate(${chartPan.x} ${chartPan.y})">
            ${activeBoundaryPath()}
          </g>
        </g>
      </svg>
      ${palettes()} ${blockToolbar()}
    </div>
  `;
}
