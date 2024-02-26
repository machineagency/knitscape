import { GLOBAL_STATE, dispatch } from "../state";

export function selectBox() {
  const [startX, startY] = [...GLOBAL_STATE.pointer];
  let [lastX, lastY] = [startX, startY];

  dispatch({ transforming: true });

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const [currX, currY] = [...GLOBAL_STATE.pointer];

      if (lastX == currX && lastY == currY) return;

      let [x0, x1] = [startX, currX].toSorted((a, b) => a - b);
      let [y0, y1] = [startY, currY].toSorted((a, b) => a - b);

      lastX = currX;
      lastY = currY;

      if (x0 == x1 || y0 == y1) return;

      dispatch({
        stitchSelect: [
          [x0, y0],
          [x1, y1],
        ],
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    dispatch({ transforming: false });
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}
