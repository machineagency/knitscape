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

function blockFillMenu(regions, index) {
  const { blockID, gap } = regions[index];

  function selectBlock(newBlockID) {
    let updatedRegions = [...regions];
    updatedRegions[index].blockID = newBlockID;
    console.log(`assigning block ${newBlockID} to region ${index}`);
    dispatch({
      regions: updatedRegions,
      selectingBlock: false,
      onBlockSelect: null,
    });
  }

  function chooseBlockFill() {
    dispatch({ selectingBlock: true, onBlockSelect: selectBlock });
  }

  function setYGap(yGap) {
    let updatedRegions = [...regions];
    updatedRegions[index].gap[1] = yGap;
    dispatch({ regions: updatedRegions });
  }

  function setXGap(xGap) {
    let updatedRegions = [...regions];
    updatedRegions[index].gap[0] = xGap;
    dispatch({ regions: updatedRegions });
  }

  return html`<button @click=${() => chooseBlockFill()}>select block</button
    >xGap<input
      type="number"
      min="0"
      value=${gap[0]}
      @change=${(e) => setXGap(Number(e.target.value))} />
    yGap<input
      type="number"
      min="0"
      @change=${(e) => setYGap(Number(e.target.value))}
      value=${gap[1]} /> `;
}

function stitchFillMenu(regions, index) {
  const { stitch } = regions[index];

  function changeStitchFill(st) {
    let updatedRegions = [...regions];
    updatedRegions[index].stitch = st;
    dispatch({ regions: updatedRegions });
  }

  return html` <select
    @change=${(e) => changeStitchFill(Number(e.target.value))}
    .value=${stitch}>
    ${Object.entries(stitches).map(
      ([st, stIndex]) =>
        html`<option value="${stIndex}" ?selected=${stitch == stIndex}>
          ${st}
        </option>`
    )}
  </select>`;
}

export function boundaryMenu() {
  const { regions, editingBoundary: index } = GLOBAL_STATE;

  if (index == null) return;

  function changeFillType(fillType) {
    let updatedRegions = [...regions];
    updatedRegions[index].fillType = fillType;
    dispatch({ regions: updatedRegions });
  }

  const { fillType } = regions[index];

  return html`<div class="boundary-menu">
    <button class="btn" @click=${() => removeBoundary(index)}>
      <i class="fa-solid fa-trash"></i>
    </button>

    <select @change=${(e) => changeFillType(e.target.value)} .value=${fillType}>
      <option value="stitch">stitch fill</option>
      <option value="block">block fill</option>
    </select>

    ${fillType == "stitch"
      ? stitchFillMenu(regions, index)
      : blockFillMenu(regions, index)}
  </div>`;
}
