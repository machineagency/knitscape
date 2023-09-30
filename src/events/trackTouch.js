import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";

export function trackTouch({ target }) {
  target.addEventListener("touchstart", (e) => {
    const { x, y } = posAtCoords(e.touches[0], target);
    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  target.addEventListener("touchmove", (e) => {
    const { x, y } = posAtCoords(e.touches[0], target);
    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  target.addEventListener("touchend", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });

  target.addEventListener("touchcancel", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });
}
