import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";

import { GLOBAL_STATE, dispatch } from "../state";
import { removeBlock } from "../interaction/blockInteraction";
import {
  removeBoundary,
  setBoundaryJoinMode,
} from "../interaction/boundaryInteraction";
import { removePath, setPathTileMode } from "../interaction/pathInteraction";
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
  const { blockEditMode, selectedPath, paths } = GLOBAL_STATE;

  if (selectedPath == null)
    return html`
      <div class="toolbar-message">
        Select a path to edit it or drag to add a new boundary.
      </div>
    `;

  const currentPath = paths[selectedPath];

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

    <div class="radio-group">
      <button
        class="${currentPath.tileMode == "round" ? "selected" : ""}"
        @click=${() => setPathTileMode(selectedPath, "round")}>
        round
      </button>
      <button
        class="${currentPath.tileMode == "step" ? "selected" : ""}"
        @click=${() => setPathTileMode(selectedPath, "step")}>
        step
      </button>
    </div>

    <div class="h-group">
      <button
        class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
        @click=${(e) => {
          dispatch({ blockEditMode: "yarn" }, true);
          e.target.blur();
        }}>
        yarn tile
      </button>
      <button
        class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
        @click=${(e) => {
          dispatch({ blockEditMode: "stitch" }, true);
          e.target.blur();
        }}>
        stitch tile
      </button>
    </div>
  `;
}

export function boundaryToolbar() {
  const { blockEditMode, selectedBoundary, boundaries, regions } = GLOBAL_STATE;

  if (selectedBoundary == null)
    return html`
      <div class="toolbar-message">
        Select a boundary to edit it or drag to add a new boundary.
      </div>
    `;

  let bbox = boundaryBbox(boundaries[selectedBoundary]);
  let region = regions[selectedBoundary];

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

    <div class="radio-group">
      <button
        class="${region.joinMode == "none" ? "selected" : ""}"
        @click=${() => setBoundaryJoinMode(selectedBoundary, "none")}>
        none
      </button>
      <button
        class="${region.joinMode == "tucks" ? "selected" : ""}"
        @click=${() => setBoundaryJoinMode(selectedBoundary, "tucks")}>
        tucks
      </button>
    </div>

    <div class="h-group">
      <button
        class="btn ${blockEditMode == "yarn" ? "solid" : ""}"
        @click=${(e) => {
          dispatch({ blockEditMode: "yarn" }, true);
          e.target.blur();
        }}>
        yarn tile
      </button>
      <button
        class="btn ${blockEditMode == "stitch" ? "solid" : ""}"
        @click=${(e) => {
          dispatch({ blockEditMode: "stitch" }, true);
          e.target.blur();
        }}>
        stitch tile
      </button>
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
