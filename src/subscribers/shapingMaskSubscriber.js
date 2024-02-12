import { drawChart } from "../charting/drawing";
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
            Math.round(state.cellWidth * width),
            Math.round(state.cellHeight * height)
          );

          lastDrawn = null;
        }

        if (lastDrawn != state.shapingMask) {
          drawChart(
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

function clearLastDrawn(blocks) {
  return Object.fromEntries(
    Object.entries(blocks).map(([blockID, block]) => {
      return [blockID, { bitmap: null, pos: [...block.pos] }];
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
          if (lastDrawn[blockID].bitmap != block.bitmap) {
            drawChart(
              document.querySelector(`[data-blockid="${blockID}"]`),
              block.bitmap,
              state.cellWidth,
              state.cellHeight,
              lastDrawn[blockID].bitmap
            );
          }
        }
      },
    };
  };
}
