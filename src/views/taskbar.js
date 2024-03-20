import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE, dispatch, undo } from "../state";
import { toggleFullscreen, currentlyFullscreen } from "../utilities/fullscreen";

export function taskbar() {
  const {
    showExampleLibrary,
    showDownload,
    showUpload,
    showSettings,
    colorMode,
  } = GLOBAL_STATE;
  return html` <div id="taskbar">
    <h1 class="site-title">KnitScape</h1>
    <button
      class="btn solid mode-toggle"
      @click=${() =>
        dispatch({
          colorMode: colorMode == "operation" ? "yarn" : "operation",
        })}>
      ${when(
        colorMode == "operation",
        () => html`<i class="fa-solid fa-terminal"></i><span>commands</span>`,
        () => html`<i class="fa-solid fa-palette"></i><span>yarn color</span>`
      )}
    </button>
    <button class="btn icon" @click=${undo}>
      <i class="fa-solid fa-undo"></i>
    </button>
    <div class="button-group">
      <button
        class="btn icon ${showExampleLibrary ? "open" : ""}"
        @click=${() => dispatch({ showExampleLibrary: true })}>
        <i class="fa-solid fa-book"></i>
      </button>
      <button
        class="btn icon ${showDownload ? "open" : ""}"
        @click=${() => dispatch({ showDownload: true })}>
        <i class="fa-solid fa-download"></i>
      </button>
      <button
        class="btn icon ${showUpload ? "open" : ""}"
        @click=${() => dispatch({ showUpload: true })}>
        <i class="fa-solid fa-upload"></i>
      </button>
      <button
        class="btn icon ${showSettings ? "open" : ""}"
        @click=${() => dispatch({ showSettings: !showSettings })}>
        <i class="fa-solid fa-gear"></i>
      </button>
      <button
        class="btn icon"
        @click=${() => window.open("https://github.com/knitscape/knitscape")}>
        <i class="fa-brands fa-github"></i>
      </button>

      <button class="btn icon" @click=${() => toggleFullscreen()}>
        <i
          class="fa-solid fa-${currentlyFullscreen()
            ? "down-left-and-up-right-to-center"
            : "up-right-and-down-left-from-center"}"></i>
      </button>
    </div>
  </div>`;
}
