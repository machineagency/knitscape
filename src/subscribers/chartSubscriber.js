import { drawChart } from "../charting/drawing";
import { setCanvasSize } from "../utilities/misc";

export function chartSubscriber() {
  return ({ state }) => {
    let { scale, chart, colorMode, yarnPalette } = state;

    let width = chart.width;
    let height = chart.height;
    let lastDrawn = colorMode == "operation" ? state.chart : state.yarnChart;

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.chart.width ||
          height != state.chart.height ||
          colorMode != state.colorMode ||
          yarnPalette != state.yarnPalette
        ) {
          width = state.chart.width;
          height = state.chart.height;
          scale = state.scale;
          colorMode = state.colorMode;
          yarnPalette = state.yarnPalette;

          setCanvasSize(
            document.getElementById("chart-canvas"),
            Math.round(state.cellWidth * width),
            Math.round(state.cellHeight * height)
          );

          lastDrawn = null;
        }

        if (
          (colorMode == "operation" && lastDrawn != state.chart) ||
          (colorMode == "yarn" && lastDrawn != state.yarnChart)
        ) {
          drawChart(
            document.getElementById("chart-canvas"),
            state.colorMode,
            state.chart,
            state.yarnChart,
            state.yarnPalette,
            scale,
            scale * state.cellAspect,
            lastDrawn
          );
          lastDrawn = colorMode == "operation" ? state.chart : state.yarnChart;
        }
      },
    };
  };
}
