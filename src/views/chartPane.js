import { html, svg } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { classMap } from "lit-html/directives/class-map.js";

import { GLOBAL_STATE, dispatch } from "../state";

import {
  chartContextMenu,
  chartPointerDown,
} from "../interaction/chartInteraction";
import { zoom, fitChart, centerZoom } from "../interaction/chartPanZoom";

import {
  boundaryView,
  activeBoundaryPath,
  boundaryBlocks,
} from "./annotations/boundaries";
import { blocks, stitchSelectBox, blockToolbar } from "./annotations/blocks";

import { currentTargetPointerPos } from "../utilities/misc";

import { boundaryToolbar, pathToolbar, freeBlockToolbar } from "./toolbars";

import { gridPattern, cellShadow, activeBoundaryMask } from "./defs";
import { palettes } from "./palettes";

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

function bottomBar() {
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
          .value=${scale}
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

function trackPointer(e) {
  const { cellWidth, cellHeight, chartPan, bbox } = GLOBAL_STATE;
  let [x, y] = currentTargetPointerPos(e);

  GLOBAL_STATE.pointer = [
    Math.floor((x - chartPan.x) / cellWidth - bbox.xMin),
    Math.floor((y - chartPan.y) / cellHeight - bbox.yMin),
  ];
}

// function pointerCellHighlight() {
//   const {
//     cellWidth,
//     cellHeight,
//     chart,
//     transforming,
//     pointer: [x, y],
//   } = GLOBAL_STATE;

//   if (transforming || x < 0 || y < 0 || x >= chart.width || y >= chart.height)
//     return;

//   return svg`<rect
//       class="cell-highlight"
//       transform="translate(${x * cellWidth + 2} ${y * cellHeight + 2})"
//       filter="url(#path-shadow)"
//       width=${cellWidth - 3}
//       height=${cellHeight - 3}></rect>`;
// }

export function chartPaneView() {
  const {
    boundaries,
    selectedBoundary,
    cellWidth,
    cellHeight,
    chartPan,
    chart,
    pointer,
    bbox,
    transforming,
    interactionMode,
    stitchSelect,
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
      <div
        style="position: absolute; bottom: 0; left: 0; transform: translate(${chartPan.x}px,${-chartPan.y}px);">
        <canvas
          style="transform: translate(${offsetX}px,${-offsetY}px); outline: 1px solid black;"
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
          interactionMode == "boundary" && selectedBoundary != null,
          boundaryBlocks
        )}
        ${when(stitchSelect, stitchSelectBox)}
        ${when(interactionMode == "block", blocks)}
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
      <div style="position: relative;">${palettes()}${blockToolbar()}</div>
      <div class="bottom-bars-container">
        ${freeBlockToolbar()} ${boundaryToolbar()} ${pathToolbar()}
        ${bottomBar()}
        <div></div>
      </div>
    </div>
  `;
}
