import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";

import { dispatch, GLOBAL_STATE } from "../state";
import { SYMBOL_DATA } from "../constants";

function operationButton(symbolName, data, index) {
  const classes = { selected: GLOBAL_STATE.activeSymbol == index };

  return html`<button
    class=${classMap(classes)}
    @click=${() => dispatch({ activeSymbol: index })}>
    <svg viewBox="0 0 1 1" class="symbol-preview">
      <rect fill=${data.color} width="100%" height="100%"></rect>
      <path
        fill="none"
        stroke="black"
        stroke-width="0.04"
        d="${data.pathdata}" />
    </svg>
  </button>`;
}

export function operationPicker() {
  let { editingBlock: blockID, blocks } = GLOBAL_STATE;

  if (!(blockID && blocks[blockID].type == "stitch")) return;

  return html` <div class="operation-picker scroller">
    ${Object.entries(SYMBOL_DATA).map(([symbolName, data], index) =>
      operationButton(symbolName, data, index)
    )}
  </div>`;
}

// export function yarnColorPicker() {
//   return html`<div class="chart-bottom-bar">
//     <div class="operation-picker scroller">
//       ${GLOBAL_STATE.symbolMap.map(
//         (symbolName, index) => html`<button
//           class="btn solid img ${GLOBAL_STATE.activeSymbol == index
//             ? "current"
//             : ""}"
//           @click=${() => dispatch({ activeSymbol: index })}>
//           <canvas class="symbol-preview" data-symbol=${symbolName}></canvas>
//         </button>`
//       )}
//     </div>
//   </div>`;
// }
