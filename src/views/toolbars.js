import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { removeBlock } from "../interaction/blockInteraction";
import { removeBoundary } from "../interaction/boundaryInteraction";

export function freeBlockToolbar() {
  const { interactionMode, blockEditMode, selectedBlock } = GLOBAL_STATE;

  if (interactionMode != "block") return;
  if (selectedBlock == null)
    return html`<div class="mode-toolbar">
      <div class="toolbar-message">
        Select a block to edit it or drag to add a new block.
      </div>
    </div> `;

  return html`<div class="mode-toolbar">
    <span class="toolbar-message">Editing block ${selectedBlock}</span>
    <button
      class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
      @click=${() => dispatch({ blockEditMode: "yarn" }, true)}>
      yarn fill
    </button>
    <button
      class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
      @click=${() => dispatch({ blockEditMode: "stitch" }, true)}>
      stitch fill
    </button>
    <button class="btn" @click=${() => removeBlock(selectedBlock)}>
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>`;
}

export function pathToolbar() {
  const { interactionMode, blockEditMode, selectedPath } = GLOBAL_STATE;

  if (interactionMode != "path") return;
  if (selectedPath == null)
    return html`<div class="mode-toolbar">
      <div class="toolbar-message">
        Select a path to edit it or drag to add a new path.
      </div>
    </div> `;

  return html`<div class="mode-toolbar">
    <span class="toolbar-message">Editing boundary ${selectedPath}</span>
    <button class="btn">edit yarn tile</button>
    <button class="btn">edit stitch tile</button>
    <button class="btn">delete</button>
  </div>`;
}

export function boundaryToolbar() {
  const { interactionMode, blockEditMode, selectedBoundary } = GLOBAL_STATE;

  if (interactionMode != "boundary") return;
  if (selectedBoundary == null)
    return html`<div class="mode-toolbar">
      <div class="toolbar-message">
        Select a boundary to edit it or drag to add a new boundary.
      </div>
    </div> `;

  return html`<div class="mode-toolbar">
    <span class="toolbar-message">Editing boundary ${selectedBoundary}</span>
    <button
      class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
      @click=${() => dispatch({ blockEditMode: "yarn" }, true)}>
      yarn fill
    </button>
    <button
      class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
      @click=${() => dispatch({ blockEditMode: "stitch" }, true)}>
      stitch fill
    </button>
    <button class="btn" @click=${() => removeBoundary(selectedBoundary)}>
      delete
    </button>
  </div>`;
}
