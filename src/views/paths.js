import { GLOBAL_STATE } from "../state";
import { html, svg } from "lit-html";
import {
  resizePathTile,
  editPathTile,
  movePathTile,
} from "../interaction/pathInteraction";

function lines(pathIndex, pts, cellWidth, cellHeight) {
  const lineElements = [];

  for (let index = 0; index < pts.length - 1; index++) {
    const [x1, y1] = pts[index];
    const [x2, y2] = pts[index + 1];
    lineElements.push(
      svg`<line
      class="path bottom"
      data-pathindex="${pathIndex}"
      data-index="${index}"
      x1=${x1 * cellWidth}
      y1=${y1 * cellHeight}
      x2=${x2 * cellWidth}
      y2=${y2 * cellHeight}>
      </line>
      <line
      class="path top"
      data-pathindex="${pathIndex}"
      data-index="${index}"
      x1=${x1 * cellWidth}
      y1=${y1 * cellHeight}
      x2=${x2 * cellWidth}
      y2=${y2 * cellHeight}></line>`
    );
  }

  return lineElements;
}

function points(pathIndex, pts, cellWidth, cellHeight) {
  return pts.map(
    ([x, y], i) => svg`<circle
      class="point"
      data-pathindex="${pathIndex}"
      data-pointindex="${i}"
      cx="${x * cellWidth}"
      cy="${y * cellHeight}" />`
  );
}

export function pathTiles() {
  const { selectedPath, paths, cellWidth, cellHeight, blockEditMode } =
    GLOBAL_STATE;
  if (blockEditMode == null || selectedPath == null) return;

  const { offset, pts } = paths[selectedPath];

  return html`<div
    class="block"
    style="left: ${Math.round(
      (pts[0][0] + offset[0]) * cellWidth
    )}px; bottom: ${Math.round((pts[0][1] + offset[1]) * cellHeight)}px;">
    <canvas id="path-tile-canvas" @pointerdown=${editPathTile}></canvas>
    <div class="block-inset-shadow"></div>
    <button class="move-block" @pointerdown=${(e) => movePathTile(e)}>
      <i class="fa-solid fa-arrows-up-down-left-right"></i>
    </button>
    <button class="dragger up" @pointerdown=${(e) => resizePathTile(e, "up")}>
      <i class="fa-solid fa-angle-up"></i>
    </button>
    <button
      class="dragger down"
      @pointerdown=${(e) => resizePathTile(e, "down")}>
      <i class="fa-solid fa-angle-down"></i>
    </button>
    <button
      class="dragger left"
      @pointerdown=${(e) => resizePathTile(e, "left")}>
      <i class="fa-solid fa-angle-left"></i>
    </button>
    <button
      class="dragger right"
      @pointerdown=${(e) => resizePathTile(e, "right")}>
      <i class="fa-solid fa-angle-right"></i>
    </button>
  </div>`;
}

export function activePath() {
  let { paths, selectedPath, scale, cellHeight } = GLOBAL_STATE;
  if (selectedPath == null) return;
  let currentPath = paths[selectedPath];
  if (!currentPath) return;
  return [
    lines(selectedPath, paths[selectedPath].pts, scale, cellHeight),
    points(selectedPath, paths[selectedPath].pts, scale, cellHeight),
  ];
}

function backgroundLine(pathIndex, pts, cellWidth, cellHeight) {
  const lineElements = [];

  for (let index = 0; index < pts.length - 1; index++) {
    const [x1, y1] = pts[index];
    const [x2, y2] = pts[index + 1];
    lineElements.push(
      svg`<line
      class="background-path"
      data-pathindex="${pathIndex}"
      x1=${x1 * cellWidth}
      y1=${y1 * cellHeight}
      x2=${x2 * cellWidth}
      y2=${y2 * cellHeight}>
      </line>
      <line
      class="background-path-hover"
      data-pathindex="${pathIndex}"
      x1=${x1 * cellWidth}
      y1=${y1 * cellHeight}
      x2=${x2 * cellWidth}
      y2=${y2 * cellHeight}></line>`
    );
  }

  return lineElements;
}

export function backgroundPathView() {
  let { paths, selectedPath, scale: cellWidth, cellHeight } = GLOBAL_STATE;

  return Object.entries(paths).map(([pathIndex, path]) => {
    if (selectedPath != pathIndex)
      return backgroundLine(pathIndex, path.pts, cellWidth, cellHeight);
  });
}
