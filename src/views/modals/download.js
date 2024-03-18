import { GLOBAL_STATE } from "../../state";
import {
  downloadWorkspace,
  downloadKniterate,
  downloadTimeNeedleBMP,
} from "../../utilities/exporters";
import { html } from "lit-html";

export function downloadModal() {
  return html` <div class="modal">
    <h2>Download</h2>
    <div class="modal-content">
      <button class="btn solid" @click=${() => downloadWorkspace(GLOBAL_STATE)}>
        Workspace JSON
      </button>
      <button class="btn solid" @click=${() => downloadKniterate(GLOBAL_STATE)}>
        Kniterate TXT
      </button>
      <button
        class="btn solid"
        @click=${() => downloadTimeNeedleBMP(GLOBAL_STATE.machineChart)}>
        Time Needle BMP
      </button>
    </div>
  </div>`;
}

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

// `<button class="btn solid" @click=${() => downloadPNG()}>Chart PNG</button>
//       <button class="btn solid" @click=${() => downloadSVG()}>
//         Simulation SVG
//       </button>
//       <button class="btn solid" @click=${() => downloadBMP()}>
//         Windows BMP (Silver Knit)
//       </button>
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

//       <div class="punchcard-preview">${punchCardSVG()}</div>`;
