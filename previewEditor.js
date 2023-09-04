import { BimpEditor } from "./bimp/BimpEditor";

import { pointerTracker } from "./bimp/pointerTracker";
import { grid } from "./bimp/grid";
import { canvasScaler } from "./bimp/canvasScaler";
import { paletteRenderer } from "./bimp/paletteRenderer";
import { imagePalette, hexPalette } from "./bimp/palettes";
import { stateHook } from "./bimp/stateHook";

import { highlight } from "./bimp/highlight";

import { buildImagePalette } from "./utils";
import { gutterView, bottomLeft } from "./gutter";

export async function buildPreview(state, canvas, { colorLayer, symbolLayer }) {
  const stitchSymbolPalette = await buildImagePalette([
    "knit_transparent",
    "purl_transparent",
    "slip",
    "tuck",
  ]);

  return new BimpEditor({
    state: {
      bitmap: colorLayer,
      symbolMap: symbolLayer,
      scale: state.scale,
      palette: state.yarnPalette,
      stitchPalette: stitchSymbolPalette,
      canvas,
    },

    components: [
      pointerTracker({ target: canvas }),
      canvasScaler(),
      paletteRenderer({ drawFunc: hexPalette }),
      paletteRenderer({
        drawFunc: imagePalette,
        paletteOverride: "stitchPalette",
        bitmapOverride: "symbolMap",
      }),
      grid(),
      highlight(),
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
