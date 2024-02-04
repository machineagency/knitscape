import { drawShapeChart } from "../contexts/shape/shapeContext";

export function redrawCharts() {
  return ({ state }) => {
    let { scale, context } = state;

    function updateContext() {
      if (context == "shape") {
        drawShapeChart(null);
      }
    }

    return {
      syncState(state) {
        if (scale != state.scale || context != state.context) {
          scale = state.scale;
          context = state.context;

          // requestAnimationFrame(updateContext);
        }
      },
    };
  };
}
