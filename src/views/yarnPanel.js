import { html } from "lit-html";

import { GLOBAL_STATE, dispatch } from "../state";
import { editYarnColor, deleteYarn, addRandomYarn } from "../charting/yarn";

export function yarnPanel(chartY, chartHeight) {
  const { cellHeight, yarnPalette, yarnExpanded } = GLOBAL_STATE;

  const panelWidth = yarnExpanded
    ? yarnPalette.length * 30
    : yarnPalette.length * 10;

  return html` <div class="yarn-panel" style="width: ${panelWidth}px">
    <div
      class="yarn-panel-container"
      style="transform: translate(0px, ${-chartY}px);
      height: ${chartHeight}px;
      width: ${panelWidth}px;
      gap: ${cellHeight < 10 ? 0 : 1}px;">
      ${yarnSequence()}
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

export function yarnSequence() {
  let { yarnChart, yarnPalette, scale, cellAspect } = GLOBAL_STATE;
  if (!yarnChart) return;
  let cellHeight = scale * cellAspect;

  let yarn2d = yarnChart.make2d();

  const yarns = [];
  for (let row = 0; row < yarnChart.height; row++) {
    yarns.push(html`<div
      data-yarnrow=${row}
      class="yarn-row"
      style="gap: ${cellHeight < 10 ? 0 : 1}px">
      ${yarnPalette.map(
        (yarn, index) =>
          html`<div
            data-yarnindex=${index}
            class="yarn-cell ${yarn2d[row].includes(index + 1)
              ? "active"
              : "inactive"}"
            style="--color: ${yarn}"></div>`
      )}
    </div>`);
  }

  return yarns;
}

export function editYarns() {
  let { yarnExpanded, yarnPalette } = GLOBAL_STATE;

  return yarnPalette.map(
    (color, index) =>
      html`<div
        class="edit-yarn-btn"
        style="--color: ${color};"
        @click=${(e) => editYarnColor(e, index)}>
        ${yarnExpanded
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
