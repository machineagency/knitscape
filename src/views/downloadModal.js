import { html } from "lit-html";
import {
  downloadBMP,
  downloadSVG,
  downloadJSON,
  downloadSilverKnitTxt,
  downloadPNG,
} from "../actions/exporters";

const styles = html`<style>
  #download-modal {
    min-width: 400px;
    max-width: 700px;
  }

  #download-modal > h3 {
    margin: 0 0 10px 0;
  }

  #download-btns {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .down-btn {
    padding: 4px;
    font-size: inherit;
    border-radius: 4px;
    font-family: "National Park";
    background-color: #363636;
    box-shadow: 0 0 2px 0 black;
    color: #bdbdbd;
  }

  .down-btn:hover {
    background-color: #535353;
    color: #e4e4e4;
  }
</style>`;

export function downloadModal() {
  return html`${styles}
    <div id="download-modal" class="modal">
      <h3>Download Pattern</h3>
      <div id="download-btns">
        <button class="down-btn" @click=${() => downloadJSON()}>
          Pattern JSON
        </button>
        <button class="down-btn" @click=${() => downloadPNG()}>
          Chart PNG
        </button>
        <button class="down-btn" @click=${() => downloadSVG()}>
          Simulation SVG
        </button>
        <button class="down-btn" @click=${() => downloadBMP()}>
          Windows BMP (Silver Knit)
        </button>
        <button class="down-btn" @click=${() => downloadSilverKnitTxt()}>
          TXT (Silver Knit)
        </button>
      </div>
    </div>`;
}
