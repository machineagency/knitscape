import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";

import { GLOBAL_STATE, dispatch, undo } from "../state";
import { toggleFullscreen, currentlyFullscreen } from "../utilities/fullscreen";

// import {
//   downloadBMP,
//   downloadSVG,
//   downloadJSON,
//   downloadSilverKnitTxt,
//   downloadPNG,
//   downloadKniterate,
//   downloadPunchcard,
// } from "../actions/exporters";

// import { punchCardSVG } from "../punchcard";

export function taskbar() {
  return html`${when(GLOBAL_STATE.showSettings, settingsModal)}
    <div id="taskbar">
      <h1 class="site-title">KnitScape</h1>

      <div class="taskbar-buttons">
        <button
          class="btn icon ${GLOBAL_STATE.showSettings ? "open" : ""}"
          @click=${() =>
            dispatch({ showSettings: !GLOBAL_STATE.showSettings })}>
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

function settingsModal() {
  return html` <div id="settings-modal" class="modal">
    <h2>Settings</h2>

    <div class="modal-content">
      <label class="form-control toggle">
        <input
          type="checkbox"
          name="debug"
          ?checked=${GLOBAL_STATE.reverseScroll}
          @change=${(e) => dispatch({ reverseScroll: e.target.checked })} />
        Invert Scroll
      </label>
    </div>
    <button
      class="btn icon"
      @click=${() => window.open("https://github.com/knitscape/knitscape")}>
      <i class="fa-brands fa-github"></i>
    </button>
  </div>`;
}

// <label class="form-control toggle">
//   <input
//     type="checkbox"
//     name="grid"
//     ?checked=${GLOBAL_STATE.grid}
//     @change=${(e) => dispatch({ grid: e.target.checked })} />
//   Grid
// </label>

// <label class="form-control toggle">
//   <input
//     type="checkbox"
//     name="debug"
//     ?checked=${GLOBAL_STATE.debug}
//     @change=${(e) => dispatch({ debug: e.target.checked })} />
//   Debug
// </label>

// <label class="form-control range">
//   Symbol Line Width
//   <input
//     type="range"
//     name="line-width"
//     min="1"
//     max="10"
//     .value=${String(GLOBAL_STATE.symbolLineWidth)}
//     ?checked=${GLOBAL_STATE.debug}
//     @input=${(e) =>
//       dispatch({ symbolLineWidth: Number(e.target.value) })} />
// </label>

//   <button class="btn icon" @click=${() => undo()}>
//   <i class="fa-solid fa-rotate-left"></i>
// </button>
// <button class="btn icon" @click=${() => newPattern()}>
//   <i class="fa-solid fa-file"></i>
// </button>
// <button class="btn icon" @click=${() => uploadFile()}>
//   <i class="fa-solid fa-upload"></i>
// </button>
// <button class="btn icon" @click=${() => dispatch({ showDownload: true })}>
//   <i class="fa-solid fa-download"></i>
// </button>
// <button
//   class="btn icon ${GLOBAL_STATE.showLibrary ? "open" : ""}"
//   @click=${() => dispatch({ showLibrary: !GLOBAL_STATE.showLibrary })}>
//   <i class="fa-solid fa-book"></i>
// </button>

// function downloadModal() {
//   return html` <div class="modal">
//     <h2>Download Pattern</h2>
//     <div class="modal-content">
//       <button class="btn solid" @click=${() => downloadJSON()}>
//         Pattern JSON
//       </button>
//       <!-- <button class="btn solid" @click=${() =>
//         downloadPNG()}>Chart PNG</button>
//       <button class="btn solid" @click=${() => downloadSVG()}>
//         Simulation SVG
//       </button> -->
//       <!-- <button class="btn solid" @click=${() => downloadBMP()}>
//         Windows BMP (Silver Knit)
//       </button> -->
//       <button class="btn solid" @click=${() => downloadSilverKnitTxt()}>
//         TXT (Silver Knit)
//       </button>
//       <button class="btn solid" @click=${() => downloadKniterate()}>
//         Kniterate TXT Import
//       </button>

//       <h3>Punchcard</h3>

//       <label class="form-control range">
//         Vertical Repeats
//         <input
//           type="range"
//           name="line-width"
//           min="1"
//           max="10"
//           .value=${String(GLOBAL_STATE.punchVerticalRepeats)}
//           @input=${(e) =>
//             dispatch({
//               punchVerticalRepeats: Number(e.target.value),
//               rows:
//                 Number(e.target.value) * GLOBAL_STATE.repeats[0].bitmap.height,
//             })} />
//       </label>

//       <button class="btn solid" @click=${() => downloadPunchcard()}>
//         Download Punchcard SVG
//       </button>

//       <div class="punchcard-preview">${punchCardSVG()}</div>
//     </div>
//   </div>`;
// }
