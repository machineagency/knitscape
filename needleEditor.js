import { Bimp } from "./bimp/Bimp";
import { BimpEditor } from "./bimp/BimpEditor";

import { pointerTracker } from "./bimp/pointerTracker";
import { grid } from "./bimp/grid";
import { canvasScaler } from "./bimp/canvasScaler";
import { paletteRenderer } from "./bimp/paletteRenderer";
import { imagePalette } from "./bimp/palettes";
import { pointerEvents } from "./bimp/pointerEvents";

import { buildImagePalette } from "./utils";

function resizeDragger(dragger) {
  return ({ state, dispatch }) => {
    let { bitmap, scale } = state;

    dragger.addEventListener("pointerdown", (e) => {
      const startBIMP = bitmap;
      const start = e.clientX;

      document.body.classList.add("grabbing");
      dragger.classList.remove("grab");

      const onmove = (e) => {
        if (e.buttons == 0) {
          window.removeEventListener("mousemove", onmove);
          document.body.classList.remove("grabbing");
          dragger.classList.add("grab");
        }

        let newWidth =
          startBIMP.width - Math.floor((start - e.clientX) / scale);
        if (newWidth < 1) return;

        dispatch({
          bitmap: startBIMP.resize(newWidth, startBIMP.height),
        });
      };

      window.addEventListener("mousemove", onmove);
    });

    return {
      syncState(state) {
        ({ bitmap, scale } = state);
      },
    };
  };
}

// A special tool that just reverses the bit underneath.
// Only works for a one - bit bitmap.
function flip(start, state, dispatch) {
  function onMove({ x, y }, state) {
    dispatch({
      bitmap: state.bitmap.draw([
        { x, y, color: state.bitmap.pixel(x, y) == 0 ? 1 : 0 },
      ]),
    });
  }

  onMove(start, state);
  return onMove;
}

export async function buildNeedleEditor(state, canvas) {
  const dragger = document.getElementById("needle-dragger");
  const palette = await buildImagePalette([
    "needle_in_work",
    "needle_out_of_work",
  ]);

  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(state.needles),
      palette,
      canvas: canvas,
    },

    components: [
      pointerTracker({ target: canvas }),
      canvasScaler(),
      paletteRenderer({
        drawFunc: imagePalette,
      }),
      grid(),
      pointerEvents({
        tools: { flip },
        eventTarget: canvas,
      }),
      resizeDragger(dragger),
    ],
  });
}
