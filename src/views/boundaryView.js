import { GLOBAL_STATE, dispatch } from "../state";
import { svg, html } from "lit-html";
import { stitches } from "../constants";
import { removeBoundary } from "../interaction/boundaries";

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
    editingBoundary,
    scale: cellWidth,
    cellAspect,
  } = GLOBAL_STATE;
  const cellHeight = cellWidth * cellAspect;

  let layers = [];
  let active = [];

  for (const [boundaryIndex, boundary] of Object.entries(boundaries)) {
    if (boundaryIndex == editingBoundary) {
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

export function boundaryMenu() {
  const { regions, editingBoundary: index } = GLOBAL_STATE;

  if (index == null) return;

  function changeFill(fill) {
    let updatedRegions = [...regions];
    updatedRegions[index].fill = fill;
    dispatch({ regions: updatedRegions });
  }

  return html`<div class="boundary-menu">
    <button class="btn" @click=${() => removeBoundary(index)}>
      <i class="fa-solid fa-trash"></i>
    </button>

    <select
      id="dropdown"
      @change=${(e) => changeFill(Number(e.target.value))}
      .value=${regions[index].fill}>
      ${Object.entries(stitches).map(
        ([st, stIndex]) =>
          html`<option
            value="${stIndex}"
            ?selected=${regions[index].fill == stIndex}>
            ${st}
          </option>`
      )}
    </select>
  </div>`;
}
