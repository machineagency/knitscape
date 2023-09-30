import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { toggleFullscreen } from "../actions/zoomFit";

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

      <button class="btn icon" @click=${() => toggleFullscreen()}>
        <i
          class="fa-solid fa-${!window.document.fullscreenElement &&
          !window.document.mozFullScreenElement &&
          !window.document.webkitFullscreenElement &&
          !window.document.msFullscreenElement
            ? "up-right-and-down-left-from-center"
            : "down-left-and-up-right-to-center"}"></i>
      </button>
    </div>
  </div>`;
}
