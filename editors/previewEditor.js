import { BimpEditor } from "../bimp/BimpEditor";

import { pointerTracker } from "../bimp/pointerTracker";
import { grid } from "../bimp/grid";
import { canvasScaler } from "../bimp/canvasScaler";
import { paletteRenderer } from "../bimp/paletteRenderer";
import { needleRenderer } from "../bimp/needleRenderer";
import { imagePalette, hexPalette } from "../bimp/palettes";
import { stateHook } from "../bimp/stateHook";

import { highlightCell } from "../bimp/highlightCell";

import { buildImagePalette } from "../utils";
import { gutterView, bottomLeft } from "../gutter";

export async function buildPreview(
  state,
  { colorLayer, symbolLayer },
  drawNeedle
) {
  const stitchSymbolPalette = await buildImagePalette([
    "knit_transparent",
    "purl_transparent",
    "slip",
    "tuck",
  ]);

  const previewCanvas = document.getElementById("preview");
  const gridCanvas = document.getElementById("pattern-grid");
  const symbolCanvas = document.getElementById("preview-symbols");
  const needleCanvas = document.getElementById("preview-needles");
  const highlightCanvas = document.getElementById("pattern-highlight");

  return new BimpEditor({
    state: {
      bitmap: colorLayer,
      symbolMap: symbolLayer,
      scale: state.scale,
      palette: state.yarnPalette,
      stitchPalette: stitchSymbolPalette,
      needles: [],
    },

    components: [
      pointerTracker({ target: gridCanvas }),

      canvasScaler({ canvas: previewCanvas }),
      canvasScaler({ canvas: symbolCanvas }),
      canvasScaler({ canvas: needleCanvas }),

      canvasScaler({ canvas: highlightCanvas }),
      canvasScaler({ canvas: gridCanvas }),

      paletteRenderer({ drawFunc: hexPalette, canvas: previewCanvas }),
      paletteRenderer({
        drawFunc: imagePalette,
        paletteOverride: "stitchPalette",
        bitmapOverride: "symbolMap",
        canvas: symbolCanvas,
      }),
      // needleRenderer({
      //   canvas: needleCanvas,
      // }),

      highlightCell({ canvas: highlightCanvas }),
      grid({ canvas: gridCanvas }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.querySelector(".bgutter .preview"),
          axis: "horizontal",
        }),
      }),
      stateHook({
        cb: gutterView({
          gutterFunc: bottomLeft,
          container: document.querySelector(".lgutter .preview"),
          axis: "vertical",
        }),
      }),
    ],
  });
}
