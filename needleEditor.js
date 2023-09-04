import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

import { BimpEditor } from "./bimp/BimpEditor";
import { Bimp } from "./bimp/Bimp";

import { pointerTracker } from "./bimp/pointerTracker";
import { grid } from "./bimp/grid";
import { canvasScaler } from "./bimp/canvasScaler";
import { paletteRenderer } from "./bimp/paletteRenderer";
import { hexPalette } from "./bimp/palettes";
import { pointerEvents } from "./bimp/pointerEvents";
import { brush } from "./bimp/tools";

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

export function buildNeedleEditor(state, canvas) {
  const dragger = document.getElementById("needle-dragger");

  return new BimpEditor({
    state: {
      bitmap: Bimp.fromJSON(state.needles),
      palette: ["#000", "f#ff"],
      canvas: canvas,
    },

    components: [
      pointerTracker({ target: canvas }),
      canvasScaler(),
      paletteRenderer({
        drawFunc: hexPalette,
      }),
      grid(),
      pointerEvents({
        tools: { brush },
        eventTarget: canvas,
      }),
      resizeDragger(dragger),
    ],
  });
}
