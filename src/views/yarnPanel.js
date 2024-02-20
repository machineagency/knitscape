import { html } from "lit-html";

import { GLOBAL_STATE, dispatch } from "../state";
import { yarnInteraction } from "../interaction/yarnInteraction";
import { editYarnColor, deleteYarn, addRandomYarn } from "../charting/yarn";

export function yarnPanel(chartY, chartHeight) {
  const { cellHeight, yarnPalette, yarnExpanded } = GLOBAL_STATE;

  const panelWidth = yarnExpanded
    ? yarnPalette.length * 30
    : yarnPalette.length * 10;

  return html` <div class="yarn-panel" style="width: ${panelWidth}px">
    <div
      @pointerdown=${(e) => yarnInteraction(e)}
      class="yarn-panel-container"
      style="transform: translate(0px, ${-chartY}px);
      height: ${chartHeight}px;
      width: ${panelWidth}px;
      gap: ${cellHeight < 10 ? 0 : 1}px;">
      ${yarnSequence(cellHeight)} ${drawYarnSelectBox()}
    </div>
    <button
      class="yarn-panel-toggle btn"
      @click=${() => dispatch({ yarnExpanded: !yarnExpanded })}>
      <i class="fa-solid fa-angles-${yarnExpanded ? "left" : "right"}"></i>
    </button>

    <button class="add-yarn btn" @click=${addRandomYarn}>
      <i class="fa-solid fa-plus"></i>
    </button>

    <div class="yarn-settings">${editYarns()}</div>
  </div>`;
}

function drawYarnSelectBox() {
  const { cellHeight } = GLOBAL_STATE;

  return GLOBAL_STATE.yarnSelections.map(
    ([start, end], index) => html`<div
      data-selectindex=${index}
      style="bottom: ${start * cellHeight}px; height: ${(end - start) *
      cellHeight}px;"
      class="yarn-select-box"></div>`
  );
}

export function yarnSequence(cellHeight) {
  if (!GLOBAL_STATE.yarnSequence) return;
  const chart = GLOBAL_STATE.chart;

  const yarns = [];
  for (let row = 0; row < chart.height; row++) {
    yarns.push(html`<div
      data-yarnrow=${row}
      class="yarn-row"
      style="gap: ${cellHeight < 10 ? 0 : 1}px">
      ${GLOBAL_STATE.yarnPalette.map(
        (yarn, index) =>
          html`<div
            data-yarnindex=${index}
            class="yarn-cell ${GLOBAL_STATE.yarnSequence[row].includes(index)
              ? "active"
              : "inactive"}"
            style="--color: ${yarn}"></div>`
      )}
    </div>`);
  }

  return yarns;
}

export function editYarns() {
  return GLOBAL_STATE.yarnPalette.map(
    (color, index) =>
      html`<div
        class="edit-yarn-btn"
        style="--color: ${color};"
        @click=${(e) => editYarnColor(e, index)}>
        ${GLOBAL_STATE.yarnExpanded
          ? html` <i class="fa-solid fa-pen"></i>
              <button
                class="delete-color-button"
                @click=${() => deleteYarn(index)}>
                <i class="fa-solid fa-circle-xmark"></i>
              </button>`
          : ""}
      </div>`
  );
}
