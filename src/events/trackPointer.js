import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";

export function trackPointer({ target }) {
  target.addEventListener("pointermove", (e) => {
    const { x, y } = posAtCoords(e, target);
    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  target.addEventListener("pointerleave", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });
}
