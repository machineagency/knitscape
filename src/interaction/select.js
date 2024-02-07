import { GLOBAL_STATE, dispatch } from "../state";

export function selectBox() {
  const {
    desktopPointerPos: start,
    chartPan: pan,
    scale,
    stitchGauge,
    rowGauge,
  } = GLOBAL_STATE;

  const cellWidth = scale / stitchGauge;
  const cellHeight = scale / rowGauge;

  let pX = Math.floor((start[0] - pan.x) / cellWidth);
  let pY = Math.floor((start[1] - pan.y) / cellHeight);

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      let cx = Math.floor(
        (GLOBAL_STATE.desktopPointerPos[0] - pan.x) / cellWidth
      );
      let cy = Math.floor(
        (GLOBAL_STATE.desktopPointerPos[1] - pan.y) / cellHeight
      );

      if (pX == cx || pY == cy) return;

      let xs = [pX, cx].toSorted((a, b) => a - b);
      let ys = [pY, cy].toSorted((a, b) => a - b);

      dispatch({
        stitchSelect: [
          [xs[0], ys[0]],
          [xs[1], ys[1]],
        ],
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}
