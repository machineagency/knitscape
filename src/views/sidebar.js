import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { getRandomColor, shuffle } from "../utils";
import jscolor from "@eastdesire/jscolor";
import { Bimp } from "../lib/Bimp";

function motifLibrary() {
  return html`<div id="repeat-library">
    <h2>Motifs</h2>
    <div id="repeat-library-content" class="scroller">
      ${GLOBAL_STATE.repeatLibrary.map(
        (repeat, index) => html`
          <div class="repeat-library-canvas">
            <canvas
              data-repeattitle=${repeat.title}
              draggable="true"
              data-repeatlibraryindex=${index}></canvas>
          </div>
          <div class="repeat-size">
            ${repeat.bitmap.width}x${repeat.bitmap.height}
          </div>
          <div class="repeat-title">${repeat.title}</div>
        `
      )}
    </div>
  </div>`;
}

function deleteColor(index) {
  if (GLOBAL_STATE.yarnPalette.length == 1) {
    alert("you need some color in your life");
    return;
  }
  const newPalette = GLOBAL_STATE.yarnPalette.filter((color, i) => i != index);
  const newBitmap = GLOBAL_STATE.yarnSequence.pixels.map((bit) => {
    if (bit == index) return 0;
    if (bit > index) return bit - 1;
    return bit;
  });

  dispatch({
    yarnPalette: newPalette,
    yarnSequence: new Bimp(
      GLOBAL_STATE.yarnSequence.width,
      GLOBAL_STATE.yarnSequence.height,
      newBitmap
    ),
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
          yarnPalette: newPalette,
          yarnSequence: GLOBAL_STATE.yarnSequence,
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
    ${GLOBAL_STATE.yarnPalette.map(
      (hexa, index) =>
        html`<button
          class="btn solid color-select ${index == GLOBAL_STATE.activeYarn
            ? "selected"
            : ""}"
          @click=${() => dispatch({ activeYarn: index })}>
          <div class="color-label">${index + 1}</div>
          <div class="color-preview" style="--current: ${hexa};">
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
        class="btn icon"
        @click=${() => {
          dispatch({
            yarnPalette: [...shuffle(GLOBAL_STATE.yarnPalette)],
          });
        }}>
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
      <button
        class="btn icon"
        @click=${() => {
          dispatch({
            yarnPalette: Array.from(
              Array(GLOBAL_STATE.yarnPalette.length),
              () => getRandomColor()
            ),
          });
        }}>
        <i class="fa-solid fa-dice"></i>
      </button>
    </div>
  </div>`;
}

function modePicker() {
  return html`<div class="mode-picker">
    <button
      class="btn solid mode-select ${GLOBAL_STATE.context == "shape"
        ? "selected"
        : ""}"
      @click=${() => dispatch({ context: "shape" })}>
      <i class="fa-solid fa-draw-polygon"></i>
      <span>shape</span>
    </button>
    <button
      class="btn solid mode-select ${GLOBAL_STATE.context == "color"
        ? "selected"
        : ""}"
      @click=${() => dispatch({ context: "color" })}>
      <i class="fa-solid fa-palette"></i>
      <span>color</span>
    </button>
    <button
      class="btn solid mode-select ${GLOBAL_STATE.context == "texture"
        ? "selected"
        : ""}"
      @click=${() => dispatch({ context: "texture" })}>
      <i class="fa-solid fa-water"></i>
      <span>texture</span>
    </button>

    <button
      class="btn solid mode-select ${GLOBAL_STATE.context == "process"
        ? "selected"
        : ""}"
      @click=${() => dispatch({ context: "process" })}>
      <i class="fa-solid fa-bars-staggered"></i>
      <span>process</span>
    </button>
  </div>`;
}

export function sidebar() {
  return html`<div class="sidebar scroller">
    ${modePicker()}
    <div class="mouse-position">
      [${GLOBAL_STATE.pos.x}, ${GLOBAL_STATE.pos.y}]
    </div>
  </div>`;
}
