import { svg, html } from "lit-html";
import { GLOBAL_STATE } from "../../state";
import {
  moveBoundaryFill,
  editBoundaryFill,
  resizeFillBlock,
} from "../../interaction/boundaryInteraction";

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
  const { selectedBoundary, regions, cellWidth, cellHeight, blockEditMode } =
    GLOBAL_STATE;
  if (blockEditMode == null || selectedBoundary == null) return;

  const { pos } = regions[selectedBoundary];

  return html`<div
    class="block"
    style="left: ${Math.round(pos[0] * cellWidth)}px; bottom: ${Math.round(
      pos[1] * cellHeight
    )}px;">
    <canvas id="block-fill-canvas" @pointerdown=${editBoundaryFill}></canvas>
    <div class="block-inset-shadow"></div>
    <button class="move-block" @pointerdown=${(e) => moveBoundaryFill(e)}>
      <i class="fa-solid fa-arrows-up-down-left-right"></i>
    </button>
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

export function backgroundBoundaryView() {
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
