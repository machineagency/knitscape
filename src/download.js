import { download, makeBMP } from "./utils";
import { html } from "lit-html";

import { GLOBAL_STATE as state } from "./state";

function downloadSVG() {
  var svg = document.getElementById("simulation");

  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);

  //add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  download(
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source),
    "swatch.svg"
  );
}

function downloadPNG() {
  download(
    document.getElementById("preview").toDataURL("image/png"),
    "chart.png"
  );
}

function downloadBMP() {
  download(
    makeBMP(
      repeatEditor.state.bitmap,
      colorChangeEditor.state.bitmap.pixels,
      colorChangeEditor.state.palette
    ).src
  );
}

function downloadSilverKnitTxt() {
  const text =
    "SilverKnit\n" +
    repeatEditor.state.bitmap
      .make2d()
      .map((row) =>
        row
          .map((pixel) => {
            if (pixel == 0 || pixel == 1) return 7;
            else return 8;
          })
          .join("")
      )
      .join("\n");

  download(
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    "pattern.txt"
  );
}

function downloadJSON() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(
      JSON.stringify({
        yarnPalette: GLOBAL_STATE.yarnPalette,
        needles: needleEditor.state.bitmap.toJSON(),
        repeat: repeatEditor.state.bitmap.toJSON(),
        yarns: colorChangeEditor.state.bitmap.vMirror().toJSON(),
      })
    );

  download(dataStr, "pattern.json");
}

const styles = html`<style>
  #download-modal {
    position: absolute;
    margin: 100px;
    align-self: center;
    min-width: 400px;
    max-width: 700px;
    z-index: 100000;
    background-color: #252525;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px 3px #0000009e;
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
    outline: 0;
    border: 0;
    padding: 4px;
    font-size: inherit;
    border-radius: 4px;
    font-family: "National Park";
    background-color: #363636;
    box-shadow: 0 0 2px 0 black;
    color: #bdbdbd;
    cursor: pointer;
  }

  .down-btn:hover {
    background-color: #535353;
    color: #e4e4e4;
  }
</style>`;

export function downloadModal() {
  return html`${styles}
    <div id="download-modal">
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
