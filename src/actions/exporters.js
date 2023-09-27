import { GLOBAL_STATE } from "../state";
import { download, makeBMP } from "../utils";

export function downloadSVG() {
  const svg = document.getElementById("simulation");

  //get svg source.
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);

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

export function downloadPNG() {
  download(
    document.getElementById("preview").toDataURL("image/png"),
    "chart.png"
  );
}

export function downloadBMP() {
  // download(
  //   makeBMP(
  //     repeatEditor.state.bitmap,
  //     colorChangeEditor.state.bitmap.pixels,
  //     colorChangeEditor.state.palette
  //   ).src
  // );

  download(
    makeBMP(
      GLOBAL_STATE.repeatBitmap,
      GLOBAL_STATE.colorSequence.pixels,
      GLOBAL_STATE.yarnPalette
    ).src
  );
}

export function downloadSilverKnitTxt() {
  const text =
    "SilverKnit\n" +
    GLOBAL_STATE.repeatBitmap
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

export function downloadJSON() {
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
