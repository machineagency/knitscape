import { svg, html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../../state";
import { stitches } from "../../constants";
import {
  removeBoundary,
  boundaryBlockPointerDown,
  resizeFillBlock,
} from "../../interaction/boundaries";
import { gridPattern } from "../defs";
import { when } from "lit-html/directives/when.js";
import { editingTools } from "../../charting/editingTools";
import { toolData } from "../../constants";

function boundaryPoints(boundaryIndex, pts, cellWidth, cellHeight) {
  return pts.map(
    ([x, y], i) => svg`<circle
      class="point"
      data-boundaryindex="${boundaryIndex}"
      data-index="${i}"
      cx="${x * cellWidth}"
      cy="${y * cellHeight}" />`
  );
}

function boundaryPaths(boundaryIndex, pts, cellWidth, cellHeight) {
  let paths = [];
  for (let i = 0; i < pts.length; i++) {
    let [x1, y1] = pts[i];
    let [x2, y2] = pts[(i + 1) % pts.length];
    paths.push(
      svg`<line
      class="path bottom"
      data-boundaryindex="${boundaryIndex}"
      data-index="${i}"
      x1=${x1 * cellWidth}
      y1=${y1 * cellHeight}
      x2=${x2 * cellWidth}
      y2=${y2 * cellHeight}>
      </line>
      <line
      class="path top"
      data-boundaryindex="${boundaryIndex}"
      data-index="${i}"
      x1=${x1 * cellWidth}
      y1=${y1 * cellHeight}
      x2=${x2 * cellWidth}
      y2=${y2 * cellHeight}></line>`
    );
  }
  return paths;
}

export function boundaryBlocks() {
  const { selectedBoundary, regions, cellWidth, cellHeight } = GLOBAL_STATE;

  const { stitchBlock, yarnBlock, pos } = regions[selectedBoundary];

  return html`<div
    class="stitch-block"
    style="left: ${Math.round(pos[0] * cellWidth) - 1}px; bottom: ${Math.round(
      pos[1] * cellHeight
    )}px;">
    <canvas id="block-fill-canvas"></canvas>

    <svg
      class="block-grid"
      style="position: absolute; top: 0px; left: 0px; overflow: hidden;"
      width="100%"
      height="100%"
      @pointerdown=${boundaryBlockPointerDown}>
      <defs>${gridPattern(cellWidth, cellHeight)}</defs>
      ${when(
        cellHeight > 10,
        () => svg`<rect
            width="100%"
            height="100%"
            fill="url(#grid)"></rect>`
      )}
    </svg>
    <button class="dragger up" @pointerdown=${(e) => resizeFillBlock(e, "up")}>
      <i class="fa-solid fa-angle-up"></i>
    </button>
    <button
      class="dragger down"
      @pointerdown=${(e) => resizeFillBlock(e, "down")}>
      <i class="fa-solid fa-angle-down"></i>
    </button>
    <button
      class="dragger left"
      @pointerdown=${(e) => resizeFillBlock(e, "left")}>
      <i class="fa-solid fa-angle-left"></i>
    </button>
    <button
      class="dragger right"
      @pointerdown=${(e) => resizeFillBlock(e, "right")}>
      <i class="fa-solid fa-angle-right"></i>
    </button>
  </div>`;
}

function activeBoundary(boundaryIndex, boundary, cellWidth, cellHeight) {
  return svg`<path
      data-boundaryindex="${boundaryIndex}"
      class="boundary active" d="M ${boundary.reduce(
        (acc, [x, y]) => `${acc} ${x * cellWidth} ${y * cellHeight}`,
        ""
      )} Z">`;
}

function inactiveBoundary(boundaryIndex, boundary, cellWidth, cellHeight) {
  return svg`<path
      data-boundaryindex="${boundaryIndex}"
      class="boundary inactive" d="M ${boundary.reduce(
        (acc, [x, y]) => `${acc} ${x * cellWidth} ${y * cellHeight}`,
        ""
      )} Z">`;
}

export function boundaryView() {
  let {
    boundaries,
    selectedBoundary,
    scale: cellWidth,
    cellAspect,
  } = GLOBAL_STATE;
  const cellHeight = cellWidth * cellAspect;

  let layers = [];
  let active = [];

  for (const [boundaryIndex, boundary] of Object.entries(boundaries)) {
    if (boundaryIndex == selectedBoundary) {
      layers.push(
        activeBoundary(boundaryIndex, boundary, cellWidth, cellHeight)
      );
      active.push(
        boundaryPaths(boundaryIndex, boundary, cellWidth, cellHeight)
      );
      active.push(
        boundaryPoints(boundaryIndex, boundary, cellWidth, cellHeight)
      );
    } else {
      layers.push(
        inactiveBoundary(boundaryIndex, boundary, cellWidth, cellHeight)
      );
    }
  }

  return layers.concat(active);
}

function setYGap(regionIndex, yGap) {
  let updatedRegions = [...GLOBAL_STATE.regions];
  updatedRegions[regionIndex].gap[1] = yGap;
  dispatch({ regions: updatedRegions });
}

function setXGap(regionIndex, xGap) {
  let updatedRegions = [...GLOBAL_STATE.regions];
  updatedRegions[regionIndex].gap[0] = xGap;
  dispatch({ regions: updatedRegions });
}

export function boundaryMenu() {
  const { regions, blockEditMode, selectedBoundary, activeBlockTool } =
    GLOBAL_STATE;

  if (selectedBoundary == null) return;

  const { stitchBlock, yarnBlock, pos, gap } = regions[selectedBoundary];

  let block = blockEditMode == "stitch" ? stitchBlock : yarnBlock;

  return html`<div class="boundary-menu">
    <button class="btn" @click=${() => removeBoundary(selectedBoundary)}>
      <i class="fa-solid fa-trash"></i>
    </button>
    <span>yarn</span>

    <label class="color-mode-toggle switch">
      <input
        type="checkbox"
        ?checked=${blockEditMode == "stitch"}
        @change=${(e) =>
          dispatch({
            blockEditMode: e.target.checked ? "stitch" : "yarn",
          })} />
      <span class="slider round"></span>
    </label>
    <span>stitch</span>
    <span>${block.width} x ${block.height} </span>
    ${Object.keys(editingTools).map(
      (toolName) => html`<button
        class="btn solid ${activeBlockTool == toolName ? "current" : ""}"
        @click=${() =>
          dispatch({
            activeBlockTool: toolName,
          })}>
        <i class=${toolData[toolName].icon}></i>
      </button>`
    )}
    <button
      class="btn solid move-repeat ${activeBlockTool == "move"
        ? "current"
        : ""}"
      @click=${() =>
        dispatch({
          activeBlockTool: "move",
        })}>
      <i class="fa-solid fa-arrows-up-down-left-right"></i>
    </button>

    <button
      class="btn"
      @click=${() => dispatch({ selectedBoundary: null }, true)}>
      <i class="fa-solid fa-circle-xmark"></i>
    </button>
  </div>`;
}
//  <label>xGap</label>
//     <input
//       class="num-input"
//       type="number"
//       min="0"
//       value=${gap[0]}
//       @change=${(e) => setXGap(selectedBoundary, Number(e.target.value))} />
//     <label>yGap</label>
//     <input
//       class="num-input"
//       type="number"
//       min="0"
//       @change=${(e) => setYGap(selectedBoundary, Number(e.target.value))}
//       value=${gap[1]} />
