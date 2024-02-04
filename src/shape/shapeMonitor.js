import { drawShapeChart, resizeCanvas } from "../views/chartPane";

export function shapeMonitor() {
  return ({ state }) => {
    let { scale, shapeChart } = state;

    let width = shapeChart.width;
    let height = shapeChart.height;
    let lastDrawn = shapeChart;

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.shapeChart.width ||
          height != state.shapeChart.height
        ) {
          width = state.shapeChart.width;
          height = state.shapeChart.height;
          scale = state.scale;

          resizeCanvas(scale);
          lastDrawn = null;
        }

        if (lastDrawn != state.shapeChart) {
          drawShapeChart(lastDrawn);
          lastDrawn = state.shapeChart;
        }
      },
    };
  };
}
