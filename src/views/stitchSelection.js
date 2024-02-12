import { html } from "lit-html";
import { GLOBAL_STATE } from "../state";
import { addStitchBlock } from "../charting/stitchblock";

export function stitchSelectToolbar() {
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
    <button class="add-stitch-block" @click=${addStitchBlock}>
      <i class="fa-solid fa-plus"></i>
      new stitch block
    </button>
  </div>`;
}
