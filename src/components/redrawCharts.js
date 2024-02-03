import { drawShapeChart } from "../contexts/shape/shapeContext";
import { drawColorChart } from "../contexts/color/colorContext";

export function redrawCharts() {
  return ({ state }) => {
    let { scale, context } = state;

    function updateContext() {
      if (context == "shape") {
        drawShapeChart(null);
      } else if (context == "color") {
        drawColorChart(null);
      }
    }

    return {
      syncState(state) {
        if (scale != state.scale || context != state.context) {
          scale = state.scale;
          context = state.context;

          requestAnimationFrame(updateContext);
        }
      },
    };
  };
}
