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
        let block =
          state.blockEditMode == "stitch"
            ? region.stitchBlock
            : region.yarnBlock;

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
          const bbox = bBoxAllBoundaries(state.boundaries);

          drawChart(
            document.getElementById("block-fill-canvas"),
            state.colorMode,
            block,
            state.yarnChart,
            state.yarnPalette,
            scale,
            scale * state.cellAspect,
            lastDrawn,
            [region.pos[0] - bbox.xMin, region.pos[1] - bbox.yMin]
          );
        }
      },
    };
  };
}
