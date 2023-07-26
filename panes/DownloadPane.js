import { html, render } from "lit-html";
import { exporters } from "../utils";

export class DownloadPane {
  constructor(parentEl, paneData, state, dispatch) {
    this.parentEl = parentEl;
    this.dispatch = dispatch;

    this.renderView(state);
  }

  doDownload(format, bitmap, palette) {
    let element = document.createElement("a");
    element.setAttribute("href", exporters[format](bitmap, palette));
    element.setAttribute("download", `pattern.${format}`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  view(state) {
    const motif = state.motifs["motif0"];
    return html`<div id="export">
      <!-- <div class="control-header">Export</div> -->
      <div class="flex-buttons">
        <button
          @click=${() => this.doDownload("txt", motif.bitmap, motif.palette)}>
          TXT
        </button>
        <!-- <button
          @click=${() => this.doDownload("jpg", motif.bitmap, motif.palette)}>
          JPG
        </button>
        <button
          @click=${() => this.doDownload("png", motif.bitmap, motif.palette)}>
          PNG
        </button> -->
        <button
          @click=${() => this.doDownload("json", motif.bitmap, motif.palette)}>
          JSON
        </button>
      </div>
    </div>`;
  }

  renderView(state) {
    render(this.view(state), this.parentEl);
  }

  sync(state) {
    this.renderView(state);
  }
}
