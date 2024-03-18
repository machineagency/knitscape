import { bmp_lib } from "../lib/bmp";
import { hexToRgb } from "./misc";
import { SYMBOL_DATA } from "../constants";

function downloadFile(dataStr, fileName) {
  const downloadAnchorNode = document.createElement("a");

  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function downloadWorkspace({
  boundaries,
  regions,
  blocks,
  cellAspect,
  yarnPalette,
}) {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(
      JSON.stringify({
        boundaries,
        regions: regions.map(({ gap, pos, yarnBlock, stitchBlock }) => {
          return {
            gap,
            pos,
            yarnBlock: yarnBlock.toJSON(),
            stitchBlock: stitchBlock.toJSON(),
          };
        }),
        cellAspect,
        yarnPalette,
        blocks: Object.fromEntries(
          Object.entries(blocks).map(([blockID, { bitmap, pos, type }]) => {
            return [blockID, { bitmap: bitmap.toJSON(), pos, type }];
          })
        ),
      })
    );

  downloadFile(dataStr, "workspace.json");
}

const stitches = ".-,!#$%^&*()_+{}[]";

export function downloadKniterate({ machineChart, yarnSequence }) {
  const colors = yarnSequence.map((yarnIndex) =>
    new Array(machineChart.width).fill(yarnIndex).join("")
  );

  const text =
    "FILE FORMAT : DAK\nYARNS\n" +
    colors.toReversed().join("\n") +
    "\nYARN PALETTE\nSTITCH SYMBOLS\n" +
    machineChart
      .make2d()
      .toReversed()
      .map((row) => row.map((stitch) => stitches[stitch]).join(""))
      .join("\n") +
    "\nEND";

  downloadFile(
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    "pattern.txt"
  );
}

export function downloadTimeNeedleBMP(machineChart) {
  const bmp2d = machineChart.make2d().toReversed();
  const rgbPalette = Object.values(SYMBOL_DATA).map(({ color }) =>
    hexToRgb(color)
  );

  const im = document.createElement("img");
  bmp_lib.render(im, bmp2d, rgbPalette);

  downloadFile(im.src, "pattern.bmp");
}

// export function downloadSVG() {
//   const svg = document.getElementById("simulation");

//   //get svg source.
//   const serializer = new XMLSerializer();
//   let source = serializer.serializeToString(svg);

//   //add name spaces.
//   if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
//     source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
//   }
//   if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
//     source = source.replace(
//       /^<svg/,
//       '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
//     );
//   }

//   //add xml declaration
//   source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

//   download(
//     "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source),
//     "swatch.svg"
//   );
// }

// export function downloadPunchcard() {
//   const svg = document.getElementById("punchcard");

//   //get svg source.
//   const serializer = new XMLSerializer();
//   let source = serializer.serializeToString(svg);

//   //add name spaces.
//   if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
//     source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
//   }
//   if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
//     source = source.replace(
//       /^<svg/,
//       '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
//     );
//   }

//   //add xml declaration
//   source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

//   download(
//     "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source),
//     "punchcard.svg"
//   );
// }

// export function downloadPNG() {
//   download(
//     document.getElementById("preview").toDataURL("image/png"),
//     "chart.png"
//   );
// }

// export function downloadSilverKnitTxt() {
//   const text =
//     "SilverKnit\n" +
//     GLOBAL_STATE.repeats[0].bitmap
//       .make2d()
//       .map((row) =>
//         row
//           .map((pixel) => {
//             if (pixel == 0 || pixel == 1) return 7;
//             else return 8;
//           })
//           .join("")
//       )
//       .join("\n");

//   download(
//     "data:text/plain;charset=utf-8," + encodeURIComponent(text),
//     "pattern.txt"
//   );
// }
