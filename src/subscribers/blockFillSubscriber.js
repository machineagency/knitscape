import { drawChart } from "../charting/drawing";
import { setCanvasSize } from "../utilities/misc";
import { bBoxAllBoundaries } from "../charting/helpers";

export function blockFillSubscriber() {
  return ({ state }) => {
    let { scale, colorMode, yarnPalette, blockEditMode } = state;

    let lastDrawn = null;
    let width = null;
    let height = null;

    return {
      syncState(state) {
        if (state.selectedBoundary == null) {
          lastDrawn = null;
          width = null;
          height = null;
          return;
        }

        let region = state.regions[state.selectedBoundary];
        let block, stitchBlock, yarnBlock, yarnOffset;
        const bbox = bBoxAllBoundaries(state.boundaries);

        if (state.blockEditMode == "stitch") {
          block = region.stitchBlock;
          stitchBlock = region.stitchBlock;
          yarnBlock = state.yarnChart;
          yarnOffset = [region.pos[0] - bbox.xMin, region.pos[1] - bbox.yMin];
        } else {
          block = region.yarnBlock;

          stitchBlock = region.stitchBlock;
          yarnBlock = region.yarnBlock;
          yarnOffset = [0, 0];
        }
        if (
          scale != state.scale ||
          width != block.width ||
          height != block.height ||
          colorMode != state.colorMode ||
          yarnPalette != state.yarnPalette ||
          blockEditMode != state.blockEditMode
        ) {
          width = block.width;
          height = block.height;
          scale = state.scale;
          colorMode = state.colorMode;
          yarnPalette = state.yarnPalette;
          blockEditMode = state.blockEditMode;
          setCanvasSize(
            document.getElementById("block-fill-canvas"),
            Math.round(block.width * state.cellWidth),
            Math.round(block.height * state.cellHeight)
          );

          lastDrawn = null;
        }

        if (lastDrawn != block) {
          drawChart(
            document.getElementById("block-fill-canvas"),
            state.colorMode,
            stitchBlock,
            yarnBlock,
            state.yarnPalette,
            scale,
            scale * state.cellAspect,
            lastDrawn,
            yarnOffset
          );
        }
      },
    };
  };
}
