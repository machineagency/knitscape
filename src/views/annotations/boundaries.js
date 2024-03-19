import { svg, html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../../state";
import {
  removeBoundary,
  boundaryBlockPointerDown,
  resizeFillBlock,
} from "../../interaction/boundaryInteraction";
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

  const { pos } = regions[selectedBoundary];

  return html`<div
    class="block"
    style="left: ${Math.round(pos[0] * cellWidth)}px; bottom: ${Math.round(
      pos[1] * cellHeight
    )}px;">
    <canvas
      id="block-fill-canvas"
      @pointerdown=${boundaryBlockPointerDown}></canvas>
    <div class="block-inset-shadow"></div>

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
  let { boundaries, selectedBoundary, scale, cellAspect } = GLOBAL_STATE;
  const cellHeight = scale * cellAspect;

  return Object.entries(boundaries).map(([boundaryIndex, boundary]) => {
    if (boundaryIndex == selectedBoundary) {
      return activeBoundary(boundaryIndex, boundary, scale, cellHeight);
    } else {
      return inactiveBoundary(boundaryIndex, boundary, scale, cellHeight);
    }
  });
}

export function activeBoundaryPath() {
  let { boundaries, selectedBoundary, scale, cellAspect } = GLOBAL_STATE;
  if (selectedBoundary == null) return;

  const cellHeight = scale * cellAspect;

  return [
    boundaryPaths(
      selectedBoundary,
      boundaries[selectedBoundary],
      scale,
      cellHeight
    ),
    boundaryPoints(
      selectedBoundary,
      boundaries[selectedBoundary],
      scale,
      cellHeight
    ),
  ];
}

// export function boundaryMenu() {
//   const { regions, blockEditMode, selectedBoundary, activeBlockTool } =
//     GLOBAL_STATE;

//   if (selectedBoundary == null) return;

//   const { stitchBlock, yarnBlock } = regions[selectedBoundary];

//   let block = blockEditMode == "stitch" ? stitchBlock : yarnBlock;

//   return html`<div class="boundary-menu">
//     <button class="btn" @click=${() => removeBoundary(selectedBoundary)}>
//       <i class="fa-solid fa-trash"></i>
//     </button>
//     <span>yarn</span>

//     <label class="color-mode-toggle switch">
//       <input
//         type="checkbox"
//         ?checked=${blockEditMode == "stitch"}
//         @change=${(e) =>
//           dispatch({
//             blockEditMode: e.target.checked ? "stitch" : "yarn",
//           })} />
//       <span class="slider round"></span>
//     </label>
//     <span>stitch</span>
//     <span>${block.width} x ${block.height} </span>
//     ${Object.keys(editingTools).map(
//       (toolName) => html`<button
//         class="btn solid ${activeBlockTool == toolName ? "current" : ""}"
//         @click=${() =>
//           dispatch({
//             activeBlockTool: toolName,
//           })}>
//         <i class=${toolData[toolName].icon}></i>
//       </button>`
//     )}
//     <button
//       class="btn solid move-repeat ${activeBlockTool == "move"
//         ? "current"
//         : ""}"
//       @click=${() =>
//         dispatch({
//           activeBlockTool: "move",
//         })}>
//       <i class="fa-solid fa-arrows-up-down-left-right"></i>
//     </button>

//     <button
//       class="btn"
//       @click=${() => dispatch({ selectedBoundary: null }, true)}>
//       <i class="fa-solid fa-circle-xmark"></i>
//     </button>
//   </div>`;
// }
