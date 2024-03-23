import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";

import { GLOBAL_STATE, dispatch } from "../state";
import { removeBlock } from "../interaction/blockInteraction";
import { removeBoundary } from "../interaction/boundaryInteraction";
import { removePath } from "../interaction/pathInteraction";
import { boundaryBbox } from "../utilities/misc";

export function freeBlockToolbar() {
  const { blockEditMode, selectedBlock } = GLOBAL_STATE;

  if (selectedBlock == null)
    return html`
      <div class="toolbar-message">
        Select a block to edit it or drag to add a new block.
      </div>
    </div> `;

  return html`<div class="mode-toolbar">
    <div class="h-group">
      <div class="has-dropdown">
        <button class="btn dropdown-toggle">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <div class="dropdown above">
          <button class="btn delete" @click=${() => removeBlock(selectedBlock)}>
            <i class="fa-solid fa-trash fa-sm"></i>
            Remove
          </button>
        </div>
      </div>
      <span class="toolbar-message">Editing block ${selectedBlock}</span>
    </div>

    <div class="has-dropdown">
      <button class="btn dropdown-toggle">edit</button>
      <div class="dropdown above align-right">
        <button
          class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
          @click=${(e) => {
            dispatch({ blockEditMode: "yarn" }, true);
            e.target.blur();
          }}>
          yarn
        </button>
        <button
          class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
          @click=${(e) => {
            dispatch({ blockEditMode: "stitch" }, true);
            e.target.blur();
          }}>
          stitch
        </button>
      </div>
    </div>
  </div>`;
}

export function pathToolbar() {
  const { blockEditMode, selectedPath } = GLOBAL_STATE;

  if (selectedPath == null)
    return html`
      <div class="toolbar-message">
        Select a path to edit it or drag to add a new boundary.
      </div>
    `;

  return html`
    <div class="h-group">
      <div class="has-dropdown">
        <button class="btn dropdown-toggle">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <div class="dropdown above">
          <button class="btn delete" @click=${() => removePath(selectedPath)}>
            <i class="fa-solid fa-trash fa-sm"></i>
            Remove
          </button>
        </div>
      </div>
      <span class="toolbar-message">
        Editing ${blockEditMode != null ? `${blockEditMode} tile of ` : ""} path
        ${selectedPath}
      </span>
    </div>

    <div class="has-dropdown">
      <button class="btn dropdown-toggle">edit fill</button>
      <div class="dropdown above align-right">
        <button
          class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
          @click=${(e) => {
            dispatch({ blockEditMode: "yarn" }, true);
            e.target.blur();
          }}>
          yarn fill
        </button>
        <button
          class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
          @click=${(e) => {
            dispatch({ blockEditMode: "stitch" }, true);
            e.target.blur();
          }}>
          stitch fill
        </button>
      </div>
    </div>
  `;
}

export function boundaryToolbar() {
  const { blockEditMode, selectedBoundary, boundaries } = GLOBAL_STATE;

  if (selectedBoundary == null)
    return html`
      <div class="toolbar-message">
        Select a boundary to edit it or drag to add a new boundary.
      </div>
    `;

  let bbox = boundaryBbox(boundaries[selectedBoundary]);

  return html` <div class="h-group">
      <div class="has-dropdown">
        <button class="btn dropdown-toggle">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <div class="dropdown above">
          <button
            class="btn delete"
            @click=${() => removeBoundary(selectedBoundary)}>
            <i class="fa-solid fa-trash fa-sm"></i>
            Remove
          </button>
        </div>
      </div>
      <span class="toolbar-message">
        Editing ${blockEditMode != null ? `${blockEditMode} fill of ` : ""}
        boundary ${selectedBoundary}
      </span>
    </div>

    <div class="has-dropdown">
      <button class="btn dropdown-toggle">edit fill</button>
      <div class="dropdown above align-right">
        <button
          class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
          @click=${(e) => {
            dispatch({ blockEditMode: "yarn" }, true);
            e.target.blur();
          }}>
          yarn fill
        </button>
        <button
          class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
          @click=${(e) => {
            dispatch({ blockEditMode: "stitch" }, true);
            e.target.blur();
          }}>
          stitch fill
        </button>
      </div>
    </div>

    <span class="area-size">
      ${bbox.width}<i class="fa-solid fa-xmark fa-xs"></i>${bbox.height}
    </span>`;
}

export function modeToolbar() {
  const { interactionMode } = GLOBAL_STATE;
  return html`<div class="mode-toolbar">
    ${when(interactionMode == "boundary", boundaryToolbar)}
    ${when(interactionMode == "path", pathToolbar)}
    ${when(interactionMode == "block", freeBlockToolbar)}
  </div>`;
}
