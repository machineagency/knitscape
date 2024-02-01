import { redrawShapeContext } from "../contexts/shape/shapeContext";

export function redrawCharts() {
  return ({ state }) => {
    let { scale, context } = state;

    function updateContext() {
      if (context == "shape") {
        redrawShapeContext();
      }

      // else if (context == "color") {
      //   drawColorChart();
      // } else if (context == "texture") {
      //   drawTextureChart();
      // } else if (context == "process") {
      //   drawProcessChart();
      // }
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
