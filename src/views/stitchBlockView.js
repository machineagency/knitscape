import { html, svg } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { editingTools } from "../charting/editingTools";
import { toolData } from "../constants";
import { GLOBAL_STATE, dispatch } from "../state";
import { gridPattern } from "./defs";
import { blockPointerDown } from "../interaction/blockInteraction";
import { addStitchBlock, removeStitchBlock } from "../charting/stitchblock";

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
      <button class="add-block" @click=${addStitchBlock}>
        <i class="fa-solid fa-plus"></i>
        stitch block
      </button>
    </div>
  </div>`;
}

export function stitchBlocks() {
  const {
    blocks,
    cellWidth,
    cellHeight,
    editingBlock,
    selectingBlock,
    onBlockSelect,
  } = GLOBAL_STATE;
  const blockTemplates = [];

  for (const [blockID, block] of Object.entries(blocks)) {
    const { pos } = block;
    blockTemplates.push(
      html`<div
        class="stitch-block"
        @pointerdown=${(e) => {
          if (selectingBlock) {
            onBlockSelect(blockID);
            return;
          }
          if (editingBlock == blockID) blockPointerDown(e, blockID);
        }}
        style="left: ${Math.round(pos[0] * cellWidth) -
        1}px; bottom: ${Math.round(pos[1] * cellHeight)}px;">
        <canvas data-blockid=${blockID}></canvas>

        <svg
          class="block-grid"
          style="position: absolute; top: 0px; left: 0px; overflow: hidden;"
          width="100%"
          height="100%">
          <defs>${gridPattern(cellWidth, cellHeight)}</defs>
          ${when(
            cellHeight > 10,
            () => svg`<rect
            width="100%"
            height="100%"
            fill="url(#grid)"></rect>`
          )}
        </svg>

        ${when(
          editingBlock == blockID,
          () => stitchBlockToolbar(blockID),
          () => html` <div class="stitch-block-hover">
            <button @click=${() => dispatch({ editingBlock: blockID })}>
              <i class="fa-solid fa-pen"></i>edit block
            </button>
          </div>`
        )}
      </div>`
    );
  }

  return blockTemplates;
}

export function stitchBlockToolbar(blockID) {
  let block = GLOBAL_STATE.blocks[blockID];
  return html` <div class="stitch-block-toolbar">
    <button class="btn" @click=${() => removeStitchBlock(blockID)}>
      <i class="fa-solid fa-trash"></i>
    </button>
    <span>${block.bitmap.width} x ${block.bitmap.height} </span>
    ${Object.keys(editingTools).map(
      (toolName) => html`<button
        class="btn solid ${GLOBAL_STATE.activeBlockTool == toolName
          ? "current"
          : ""}"
        @click=${() =>
          dispatch({
            activeBlockTool: toolName,
          })}>
        <i class=${toolData[toolName].icon}></i>
      </button>`
    )}
    <button
      class="btn solid move-repeat ${GLOBAL_STATE.activeBlockTool == "move"
        ? "current"
        : ""}"
      @click=${() =>
        dispatch({
          activeBlockTool: "move",
        })}>
      <i class="fa-solid fa-arrows-up-down-left-right"></i>
    </button>
    <button class="btn" @click=${() => dispatch({ editingBlock: null }, true)}>
      <i class="fa-solid fa-circle-xmark"></i>
    </button>
  </div>`;
}
