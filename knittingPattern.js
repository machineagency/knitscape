import { Bimp } from "/Bimp";
import { BimpEditor } from "/BimpEditor";

import { brush, flood, line, rect, shift, pan } from "/tools";
import { toolbox } from "/toolbox";

import { numberGutter } from "/numberGutter";

import { drawingCanvas } from "/drawingCanvas";
import { grid } from "/grid";
import { highlight } from "/highlight";
import { buildSymbolPalette } from "/palette";
import { controlPanel } from "/controlPanel";

import knitUrl from "./stitchSymbols/knit.png";
import slipUrl from "./stitchSymbols/slip.png";
import tuckUrl from "./stitchSymbols/tuck.png";
import purlUrl from "./stitchSymbols/purl.png";

import defaultPattern from "./pyramids.json";

async function initPalette() {
  const knit = new Image();
  knit.src = knitUrl;
  await knit.decode();
  const slip = new Image();
  slip.src = slipUrl;
  await slip.decode();
  const tuck = new Image();
  tuck.src = tuckUrl;
  await tuck.decode();
  const purl = new Image();
  purl.src = purlUrl;
  await purl.decode();

  return {
    symbols: [
      { image: knit, title: "Knit" },
      { image: purl, title: "Purl" },
      { image: slip, title: "Slip" },
      { image: tuck, title: "Tuck" },
    ],
  };
}

function bottomLeft({ bitmap }, gutterPos, size) {
  if (gutterPos == "bottom" || gutterPos == "top") {
    return Array.apply(null, Array(bitmap.width)).map((x, i) => i + 1);
  } else if (gutterPos == "left" || gutterPos == "right") {
    return Array.apply(null, Array(bitmap.height))
      .map((x, i) => i + 1)
      .reverse();
  }
}

export async function knittingPattern(parent) {
  let state = {
    bitmap: Bimp.fromJSON(defaultPattern),
    aspectRatio: [1, 1],
    scale: 1,
    pan: { x: 0, y: 0 },
  };

  let editor = new BimpEditor({
    state,
    parent,
    components: [
      drawingCanvas({
        paletteBuilder: buildSymbolPalette(await initPalette()),
      }),
      grid(),
      highlight({ cell: true }),
      toolbox({ tools: { brush, flood, line, rect, shift, pan } }),
      controlPanel(),
      numberGutter({ size: 20, gutterPos: "left", gutterFunc: bottomLeft }),
      numberGutter({
        size: 20,
        gutterPos: "right",
        gutterFunc: bottomLeft,
      }),
      numberGutter({ size: 20, gutterPos: "top", gutterFunc: bottomLeft }),
      numberGutter({
        size: 20,
        gutterPos: "bottom",
        gutterFunc: bottomLeft,
      }),
    ],
  });
}
