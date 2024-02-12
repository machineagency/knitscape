import { html, svg } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { editingTools } from "../charting/editingTools";
import { toolData } from "../constants";
import { GLOBAL_STATE, dispatch } from "../state";
import { gridPattern } from "./grid";
import { blockPointerDown } from "../interaction/blockInteraction";
import { removeStitchBlock } from "../charting/stitchblock";

export function stitchBlocks() {
  const { blocks, scale, cellWidth, cellHeight, editingBlock } = GLOBAL_STATE;
  const blockTemplates = [];

  for (const [blockID, block] of Object.entries(blocks)) {
    const { pos, bitmap } = block;
    blockTemplates.push(
      html`<div
        class="stitch-block"
        @pointerdown=${(e) => {
          if (editingBlock == blockID) blockPointerDown(e, blockID);
        }}
        style="left: ${Math.round(pos[0] * cellWidth) -
        1}px; bottom: ${Math.round(pos[1] * cellHeight) - 1}px;">
        ${when(
          editingBlock == blockID,
          () => stitchBlockToolbar(blockID),
          () => html` <div class="stitch-block-hover">
            <button @click=${() => dispatch({ editingBlock: blockID })}>
              <i class="fa-solid fa-pen"></i>edit block
            </button>
          </div>`
        )}

        <canvas data-blockid=${blockID}></canvas>

        <!-- <svg
          class="block-grid"
          style="position: absolute; top: 0px; left: 0px;
        overflow: hidden;"
          width="100%"
          height="100%">
          <defs>${gridPattern(cellWidth, cellHeight)}</defs>
          <rect class="block-outline" width="100%" height="100%"></rect>
          ${when(
          cellHeight > 10,
          () => svg`<rect
            width=${bitmap.width * cellWidth}
            height=${bitmap.height * cellHeight}
            fill="url(#grid)"></rect>`
        )}
        </svg> -->
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
      <i class="fa-solid fa-hand"></i>
    </button>
    <button
      class="btn"
      @click=${() =>
        dispatch(
          {
            editingBlock: null,
          },
          true
        )}>
      <i class="fa-solid fa-circle-xmark"></i>
    </button>
  </div>`;
}
