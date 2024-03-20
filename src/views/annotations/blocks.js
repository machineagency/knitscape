import { html, svg } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { editingTools } from "../../charting/editingTools";
import { toolData } from "../../constants";
import { GLOBAL_STATE, dispatch } from "../../state";
import { gridPattern } from "../defs";
import {
  blockPointerDown,
  removeBlock,
  resizeBlock,
  addBlock,
} from "../../interaction/blockInteraction";
import { addBoundary } from "../../interaction/boundaryInteraction";

export function stitchSelectBox() {
  const {
    stitchSelect: [bl, tr],
    cellWidth,
    cellHeight,
  } = GLOBAL_STATE;

  return html`<div
    class="stitch-select-box"
    style="width: ${(tr[0] - bl[0]) * cellWidth}px; height: ${(tr[1] - bl[1]) *
    cellHeight}px; left: ${bl[0] * cellWidth}px; bottom: ${bl[1] *
    cellHeight}px;">
    <svg>
      <rect class="stitch-select" width="100%" height="100%"></rect>
    </svg>
    <div class="select-tools">
      <button class="add-block" @click=${addBlock}>
        <i class="fa-solid fa-plus"></i>
        block
      </button>
      <button class="add-block" @click=${addBoundary}>
        <i class="fa-solid fa-plus"></i>
        boundary
      </button>
      <button
        class="add-block"
        @click=${() => dispatch({ stitchSelect: null })}>
        <i class="fa-solid fa-cancel"></i>
        cancel
      </button>
    </div>
  </div>`;
}

export function blocks() {
  const { blocks, cellWidth, cellHeight, selectedBlock } = GLOBAL_STATE;
  return blocks.map(
    (block, blockIndex) =>
      html`<div
        class="block"
        style="left: ${Math.round(block.pos[0] * cellWidth) -
        1}px; bottom: ${Math.round(block.pos[1] * cellHeight)}px;">
        <canvas
          data-blockindex=${blockIndex}
          @pointerdown=${(e) => {
            if (selectedBlock == blockIndex) blockPointerDown(e, blockIndex);
          }}></canvas>
        <div class="block-inset-shadow"></div>
        ${when(
          selectedBlock == blockIndex,
          () => draggers(blockIndex),
          () => html` <div class="hover-overlay">
            <button
              class=" btn solid"
              @click=${() => dispatch({ selectedBlock: blockIndex })}>
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>`
        )}
      </div>`
  );
}

function draggers(blockIndex) {
  return html` <button
      class="btn solid block-remove"
      @click=${() => removeBlock(blockIndex)}>
      <i class="fa-solid fa-trash"></i>
    </button>

    <button
      class="dragger up"
      @pointerdown=${(e) => resizeBlock(e, blockIndex, "up")}>
      <i class="fa-solid fa-angle-up"></i>
    </button>
    <button
      class="dragger down"
      @pointerdown=${(e) => resizeBlock(e, blockIndex, "down")}>
      <i class="fa-solid fa-angle-down"></i>
    </button>
    <button
      class="dragger left"
      @pointerdown=${(e) => resizeBlock(e, blockIndex, "left")}>
      <i class="fa-solid fa-angle-left"></i>
    </button>
    <button
      class="dragger right"
      @pointerdown=${(e) => resizeBlock(e, blockIndex, "right")}>
      <i class="fa-solid fa-angle-right"></i>
    </button>`;
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

export function blockToolbar() {
  let block = getCurrentBlock();
  if (block == null) return;

  const { activeBlockTool, blockEditMode } = GLOBAL_STATE;

  return html` <div class="block-toolbar">
    <button
      class="btn solid mode-toggle"
      @click=${() =>
        dispatch({
          blockEditMode: blockEditMode == "stitch" ? "yarn" : "stitch",
        })}>
      ${when(
        blockEditMode == "stitch",
        () => html`<span>editing commands</span>`,
        () => html`<span>editing yarn</span>`
      )}
    </button>
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
    <button class="btn" @click=${() => dispatch({ selectedBlock: null }, true)}>
      <i class="fa-solid fa-circle-xmark"></i>
    </button>
  </div>`;
}
