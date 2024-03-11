import { drawChart } from "../charting/drawing";
import { setCanvasSize } from "../utilities/misc";

export function chartSubscriber() {
  return ({ state }) => {
    let { scale, chart, colorMode } = state;

    let width = chart.width;
    let height = chart.height;
    let lastDrawn = colorMode == "operation" ? state.chart : state.yarnChart;

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.chart.width ||
          height != state.chart.height ||
          colorMode != state.colorMode
        ) {
          width = state.chart.width;
          height = state.chart.height;
          scale = state.scale;
          colorMode = state.colorMode;

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

function clearLastDrawn(blocks) {
  return Object.fromEntries(
    Object.entries(blocks).map(([blockID, block]) => {
      return [
        blockID,
        { bitmap: null, pos: [...block.pos], width: null, height: null },
      ];
    })
  );
}

function rescaleAll(blocks, cellWidth, cellHeight) {
  for (const [blockID, block] of Object.entries(blocks)) {
    setCanvasSize(
      document.querySelector(`[data-blockid="${blockID}"]`),
      Math.round(block.bitmap.width * cellWidth),
      Math.round(block.bitmap.height * cellHeight)
    );
  }
}

export function blockSubscriber() {
  return ({ state }) => {
    let { scale, blocks } = state;

    let lastDrawn = clearLastDrawn(blocks);

    return {
      syncState(state) {
        if (
          Object.keys(lastDrawn).length != Object.keys(state.blocks).length ||
          scale != state.scale
        ) {
          // A repeat was added or removed, or we scaled, update lastdrawn
          scale = state.scale;
          rescaleAll(state.blocks, state.cellWidth, state.cellHeight);
          lastDrawn = clearLastDrawn(state.blocks);
        }

        for (const [blockID, block] of Object.entries(state.blocks)) {
          if (
            lastDrawn[blockID].width != block.bitmap.width ||
            lastDrawn[blockID].height != block.bitmap.height
          ) {
            setCanvasSize(
              document.querySelector(`[data-blockid="${blockID}"]`),
              Math.round(block.bitmap.width * state.cellWidth),
              Math.round(block.bitmap.height * state.cellHeight)
            );

            lastDrawn[blockID].width = block.bitmap.width;
            lastDrawn[blockID].height = block.bitmap.height;
          }

          if (lastDrawn[blockID].bitmap != block.bitmap) {
            drawChart(
              document.querySelector(`[data-blockid="${blockID}"]`),
              state.colorMode,
              block.bitmap,
              state.yarnChart,
              state.yarnPalette,
              scale,
              scale * state.cellAspect,

              lastDrawn[blockID].bitmap
            );
          }
        }
      },
    };
  };
}
