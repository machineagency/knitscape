import { html } from "lit-html";
import {
  downloadBMP,
  downloadSVG,
  downloadJSON,
  downloadSilverKnitTxt,
  downloadPNG,
} from "../actions/exporters";

export function downloadModal() {
  return html` <div class="modal">
    <h2>Download Pattern</h2>
    <div class="modal-content">
      <button class="btn solid" @click=${() => downloadJSON()}>
        Pattern JSON
      </button>
      <!-- <button class="btn solid" @click=${() =>
        downloadPNG()}>Chart PNG</button>
      <button class="btn solid" @click=${() => downloadSVG()}>
        Simulation SVG
      </button> -->
      <!-- <button class="btn solid" @click=${() => downloadBMP()}>
        Windows BMP (Silver Knit)
      </button> -->
      <button class="btn solid" @click=${() => downloadSilverKnitTxt()}>
        TXT (Silver Knit)
      </button>
    </div>
  </div>`;
}
