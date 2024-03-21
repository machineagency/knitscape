import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";

import { classMap } from "lit-html/directives/class-map.js";

import { dispatch, GLOBAL_STATE } from "../state";
import { SYMBOL_DATA } from "../constants";
import { editingTools } from "../charting/editingTools";
import { toolData } from "../constants";

const TRANSPARENT_YARN = "#585858";

function operationButton(symbolName, data, index) {
  if (symbolName == "EMPTY") return;
  const classes = { selected: GLOBAL_STATE.activeSymbol == index };

  return html`<button
    class=${classMap(classes)}
    @click=${() => dispatch({ activeSymbol: index })}>
    <svg viewBox="0 0 1 1">
      <rect fill=${data.color} width="100%" height="100%"></rect>
      <path
        fill="none"
        stroke="black"
        stroke-width="0.04"
        d="${data.pathdata}" />
    </svg>
  </button>`;
}

function yarnButton(paletteIndex, color) {
  const classes = { selected: GLOBAL_STATE.activeYarn == paletteIndex };

  return html`<button
    style="--color: ${color};"
    class=${classMap(classes)}
    @click=${() => dispatch({ activeYarn: paletteIndex })}></button>`;
}

export function pickers() {
  const {
    selectedBoundary,
    blockEditMode,
    selectedBlock,
    blocks,
    yarnPalette,
  } = GLOBAL_STATE;

  if (blockEditMode == null) return;

  return html`<div class="picker-container">
    ${toolPicker()}
    <div class="palette scroller">
      ${when(
        blockEditMode == "stitch",
        () =>
          Object.entries(SYMBOL_DATA).map(([symbolName, data], index) =>
            operationButton(symbolName, data, index)
          ),
        () => html`${yarnButton(0, TRANSPARENT_YARN)}
        ${yarnPalette.map((color, index) => yarnButton(index + 1, color))}`
      )}
      <button
        class="btn close-picker"
        @click=${() => dispatch({ blockEditMode: null }, true)}>
        <i class="fa-solid fa-circle-xmark fa-xl"></i>
      </button>
    </div>
  </div>`;
}

function getCurrentBlock() {
  const { blocks, selectedBlock, blockEditMode, selectedBoundary, regions } =
    GLOBAL_STATE;

  let currentBlock = null;

  if (selectedBoundary != null) {
    currentBlock =
      blockEditMode == "stitch"
        ? regions[selectedBoundary].stitchBlock
        : regions[selectedBoundary].yarnBlock;
  } else if (selectedBlock != null) {
    currentBlock =
      blockEditMode == "stitch"
        ? blocks[selectedBlock].stitchBlock
        : blocks[selectedBlock].yarnBlock;
  }

  return currentBlock;
}

function toolPicker() {
  const { activeBlockTool, blockEditMode } = GLOBAL_STATE;
  if (blockEditMode == null) return;
  let block = getCurrentBlock();
  if (block == null) return;

  return html`<div class="tool-picker">
    <!-- <span>${block.width} x ${block.height} </span> -->

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
  </div>`;
}
