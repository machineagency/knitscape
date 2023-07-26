import { html, render } from "lit-html";
import { addPanZoom } from "../addPanZoom";

import { tools } from "../tools";
import { canvasEvents } from "../addCanvasInteraction";

function sizeControls(motifID, state, dispatch, center) {
  const current = state.motifs[motifID].bitmap;
  const width = current.width,
    height = current.height;
  return html`<div class="size">
    <div
      class="input-spinner"
      @click=${() =>
        dispatch("resizeMotif", [width - 1, height, motifID], center)}>
      <i class="fa-solid fa-minus fa-2xs fa-fw"></i>
    </div>
    <input
      type="text"
      inputmode="numeric"
      min="1"
      step="1"
      id="width"
      @change=${(e) =>
        dispatch(
          "resizeMotif",
          [Number(e.target.value), height, motifID],
          center
        )}
      value=${width} />
    <div
      class="input-spinner"
      @click=${() =>
        dispatch("resizeMotif", [width + 1, height, motifID], center)}>
      <i class="fa-solid fa-plus fa-2xs fa-fw"></i>
    </div>
    <span>by</span>
    <div
      class="input-spinner"
      @click=${() =>
        dispatch("resizeMotif", [width, height - 1, motifID], center)}>
      <i class="fa-solid fa-minus fa-2xs fa-fw"></i>
    </div>
    <input
      type="text"
      inputmode="numeric"
      min="1"
      step="1"
      @change=${(e) =>
        dispatch(
          "resizeMotif",
          [width, Number(e.target.value), motifID],
          center
        )}
      value=${height} />
    <div
      class="input-spinner"
      @click=${() =>
        dispatch("resizeMotif", [width, height + 1, motifID], center)}>
      <i class="fa-solid fa-plus fa-2xs fa-fw"></i>
    </div>
  </div>`;
}

export function bitmapEditorView(activeTool, setActiveTool) {
  return html`
    <div class="tool-group">
      <div
        class="tool-select ${activeTool == "brush"
          ? "selected"
          : "not-selected"}"
        @click=${() => setActiveTool("brush")}>
        <i class="fa-solid fa-paintbrush"></i>
      </div>
      <div
        class="tool-select ${activeTool == "flood"
          ? "selected"
          : "not-selected"}"
        @click=${() => setActiveTool("flood")}>
        <i class="fa-solid fa-fill-drip"></i>
      </div>
      <div
        class="tool-select ${activeTool == "rect"
          ? "selected"
          : "not-selected"}"
        @click=${() => setActiveTool("rect")}>
        <i class="fa-solid fa-vector-square"></i>
      </div>
      <div
        class="tool-select ${activeTool == "line"
          ? "selected"
          : "not-selected"}"
        @click=${() => setActiveTool("line")}>
        <i class="fa-solid fa-minus"></i>
      </div>
      <div
        class="tool-select ${activeTool == "pan" ? "selected" : "not-selected"}"
        @click=${() => setActiveTool("pan")}>
        <i class="fa-solid fa-up-down-left-right"></i>
      </div>
    </div>
  `;
}

export class BitmapEditorPane {
  constructor(parentEl, paneData, state, dispatch) {
    this.parentEl = parentEl;
    this.canvasEl = null;
    this.motifID = paneData;
    this.dispatch = dispatch;
    this.paneState = {
      activeTool: "brush",
      activeColor: 0,
      panZoom: null,
      scale: state.motifs[this.motifID].palette.scale,
    };

    this.renderView(state);

    // Do anything that depends on the DOM existing
    this.canvasContainer = this.parentEl.querySelectorAll(
      ":scope > .canvas-container"
    )[0];
    this.canvasEl = this.parentEl.getElementsByClassName("bitmap-canvas")[0];

    this.paneState.panZoom = addPanZoom(this.canvasContainer, this.paneState);

    const motif = state.motifs[this.motifID];
    const currentBitmap = motif.bitmap;
    const palette = motif.palette;

    this.paneState.panZoom.setScaleXY({
      x: [0, currentBitmap.width * palette.scale[0]],
      y: [0, currentBitmap.height * palette.scale[1]],
    });

    const onDown = (pos, color) => {
      let tool = tools[this.paneState.activeTool];
      if (!tool) return;
      let toolMove = tool(pos, this.motifID, state, dispatch, color);
      if (toolMove) return (pos) => toolMove(pos, state);
    };

    canvasEvents(this.canvasEl, this.paneState, onDown);
  }

  renderView(state) {
    render(this.view(state), this.parentEl);
  }

  center(state) {
    let current = state.motifs[this.motifID];
    this.paneState.panZoom.setScaleXY({
      x: [0, current.bitmap.width * current.palette.scale[0]],
      y: [0, current.bitmap.height * current.palette.scale[1]],
    });
  }

  view(state) {
    return html` <div class="canvas-container">
        <canvas class="bitmap-canvas transform-group"></canvas>
      </div>
      <div class="toolbar">
        ${bitmapEditorView(this.paneState.activeTool, (tool) => {
          this.paneState.activeTool = tool;
          this.renderView(state);
        })}
        ${sizeControls(
          this.motifID,
          state,
          this.dispatch,
          this.center.bind(this)
        )}
      </div>`;
  }

  sync(state) {
    let motif = state.motifs[this.motifID];
    motif.bimpCanvas.updateOffscreenCanvas(motif.bitmap, motif.palette);
    motif.bimpCanvas.transferOffscreenToCanvas(this.canvasEl);
  }
}
