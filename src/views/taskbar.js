import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";

export function taskbar() {
  return html`<div id="taskbar">
    <h1 class="site-title">KnitScape</h1>
    <div class="taskbar-buttons">
      <button
        class="btn icon ${GLOBAL_STATE.showFileMenu ? "open" : ""}"
        @click=${() => dispatch({ showFileMenu: !GLOBAL_STATE.showFileMenu })}>
        <i class="fa-solid fa-folder"></i>
      </button>
      <button
        class="btn icon ${GLOBAL_STATE.showLibrary ? "open" : ""}"
        @click=${() => dispatch({ showLibrary: !GLOBAL_STATE.showLibrary })}>
        <i class="fa-solid fa-book"></i>
      </button>
      <button
        class="btn icon ${GLOBAL_STATE.showSettings ? "open" : ""}"
        @click=${() => dispatch({ showSettings: !GLOBAL_STATE.showSettings })}>
        <i class="fa-solid fa-gear"></i>
      </button>
      <button
        class="btn icon"
        @click=${() =>
          window.open("https://github.com/branchwelder/knitscape")}>
        <i class="fa-brands fa-github"></i>
      </button>
    </div>
  </div>`;
}
