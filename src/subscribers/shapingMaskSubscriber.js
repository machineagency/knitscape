import { drawShapingMask } from "../chart/drawing";
import { setCanvasSize } from "../utilities/misc";

export function shapingMaskSubscriber() {
  return ({ state }) => {
    let { scale, shapingMask } = state;

    let width = shapingMask.width;
    let height = shapingMask.height;
    let lastDrawn = shapingMask;

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.shapingMask.width ||
          height != state.shapingMask.height
        ) {
          width = state.shapingMask.width;
          height = state.shapingMask.height;
          scale = state.scale;

          setCanvasSize(
            document.getElementById("chart-canvas"),
            Math.round((scale * width) / state.stitchGauge),
            Math.round((scale * height) / state.rowGauge)
          );

          lastDrawn = null;
        }

        if (lastDrawn != state.shapingMask) {
          drawShapingMask(
            document.getElementById("chart-canvas"),
            state.shapingMask,
            scale / state.stitchGauge,
            scale / state.rowGauge,
            lastDrawn
          );
          lastDrawn = state.shapingMask;
        }
      },
    };
  };
}
