import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";

import { dispatch, GLOBAL_STATE } from "../state";
import { SYMBOL_DATA } from "../constants";
const TRANSPARENT_YARN = "#585858";

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

function yarnButton(paletteIndex, color) {
  const classes = { selected: GLOBAL_STATE.activeYarn == paletteIndex };

  return html`<button
    style="--color: ${color};"
    class=${classMap(classes)}
    @click=${() => dispatch({ activeYarn: paletteIndex })}></button>`;
}

export function palettes() {
  const {
    selectedBoundary,
    blockEditMode,
    selectedBlock,
    blocks,
    yarnPalette,
  } = GLOBAL_STATE;

  if (blockEditMode == null) {
    return;
  } else if (blockEditMode == "stitch") {
    return html` <div class="operation-picker scroller">
      ${Object.entries(SYMBOL_DATA).map(([symbolName, data], index) =>
        operationButton(symbolName, data, index)
      )}
    </div>`;
  } else if (blockEditMode == "yarn") {
    return html` <div class="yarn-color-picker scroller">
      ${yarnButton(0, TRANSPARENT_YARN)}
      ${yarnPalette.map((color, index) => yarnButton(index + 1, color))}
    </div>`;
  }
}
