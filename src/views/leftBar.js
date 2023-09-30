import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { LAYERS } from "../constants";
import { getRandomColor } from "../utils";
import jscolor from "@eastdesire/jscolor";

function symbolPicker() {
  return html` <div id="symbol-picker">
    <h3>Symbols</h3>
    ${GLOBAL_STATE.symbolMap.map(
      (symbolName, index) => html`<button
        class="btn solid img ${GLOBAL_STATE.activeSymbol == index
          ? "current"
          : ""}"
        @click=${() => dispatch({ activeSymbol: index })}>
        <span>${symbolName}</span>
        <img
          class="symbol-img"
          style="background-color: ${GLOBAL_STATE.chartBackground};"
          src=${GLOBAL_STATE.symbolPalette[symbolName]
            ? GLOBAL_STATE.symbolPalette[symbolName].src
            : ""} />
      </button>`
    )}
  </div>`;
}

function motifPicker() {
  return html` <div id="motif-picker">
    <h3>Motifs</h3>
    ${GLOBAL_STATE.motifLibrary.map(
      (motif, index) => html`<button
        class="btn text solid ${GLOBAL_STATE.activeMotif == index
          ? "current"
          : ""}"
        @click=${() => dispatch({ activeMotif: index })}>
        ${motif.title}
      </button>`
    )}
  </div>`;
}

function layerPicker() {
  return html` <div id="layer-picker">
    <h3>Editing</h3>
    ${LAYERS.map(
      (layer) => html`<button
        class="btn text solid ${GLOBAL_STATE.activeLayer == layer
          ? "current"
          : ""}"
        @click=${() => dispatch({ activeLayer: layer })}>
        ${layer}
      </button>`
    )}
  </div>`;
}

function deleteColor(index) {
  if (GLOBAL_STATE.yarnPalette.length == 1) {
    alert("you need some color in your life");
    return;
  }
  const newPalette = GLOBAL_STATE.yarnPalette.filter((color, i) => i != index);
  const newBitmap = GLOBAL_STATE.bitmap.pixels.map((bit) => {
    if (bit == index) return 0;
    if (bit > index) return bit - 1;
    return bit;
  });

  dispatch({
    palette: newPalette,
    bitmap: new Bimp(GLOBAL_STATE.width, GLOBAL_STATE.height, newBitmap),
  });
}

function editColor(index) {
  const target = document.getElementById(`color-${index}`);
  if (!target.jscolor) {
    const picker = new jscolor(target, {
      preset: "dark large",
      format: "hexa",
      value: GLOBAL_STATE.yarnPalette[index],
      onInput: () => {
        const newPalette = [...GLOBAL_STATE.yarnPalette];
        newPalette[index] = picker.toRGBAString();
        dispatch({
          palette: newPalette,
          bitmap: new Bimp(
            GLOBAL_STATE.width,
            GLOBAL_STATE.height,
            GLOBAL_STATE.bitmap.pixels
          ),
        });
      },
      previewElement: null,
    });
  }
  target.jscolor.show();
}

function yarnPicker() {
  return html`<div id="yarn-picker">
    <h3>Yarns</h3>
    ${GLOBAL_STATE.yarnPalette.map(
      (hexa, index) =>
        html`<button
          class="btn solid color-select ${index == GLOBAL_STATE.activeYarn
            ? "selected"
            : ""}"
          @click=${() => dispatch({ activeYarn: index })}>
          <span style="width: 20px; text-align: center;">${index + 1}</span>
          <div style="--current: ${hexa};">
            ${GLOBAL_STATE.editingPalette
              ? html`
                  <button
                    class="delete-color-button"
                    @click=${() => deleteColor(index)}>
                    <i class="fa-solid fa-circle-xmark"></i>
                  </button>
                  <button
                    id="color-${index}"
                    class="edit-color-btn"
                    @click=${(e) => editColor(index)}></button>
                  <div
                    class="edit-color-icon"
                    @click=${(e) => editColor(index)}>
                    <i class="fa-solid fa-pen"></i>
                  </div>
                `
              : ""}
          </div>
        </button>`
    )}
    <div>
      <button
        class="btn icon ${GLOBAL_STATE.editingPalette ? "selected" : ""}"
        @click=${() =>
          dispatch({ editingPalette: !GLOBAL_STATE.editingPalette })}>
        <i class="fa-solid fa-pen"></i>
      </button>
      <button
        class="btn icon"
        @click=${() => {
          let newPalette = [...GLOBAL_STATE.yarnPalette];
          newPalette.push(getRandomColor());
          dispatch({ yarnPalette: newPalette });
        }}>
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  </div>`;
}

export function leftBar() {
  return html`<div id="left-bar">
    ${symbolPicker()} ${yarnPicker()} ${motifPicker()} ${layerPicker()}
  </div>`;
}
