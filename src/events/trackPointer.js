import { GLOBAL_STATE, dispatch } from "../state";

export function trackPointer({ target }) {
  function posAtCoords(clientX, clientY) {
    const bounds = target.getBoundingClientRect();

    const x = Math.floor(
      ((clientX - bounds.x) / GLOBAL_STATE.scale) * devicePixelRatio
    );
    const y = Math.floor(
      ((clientY - bounds.y) / GLOBAL_STATE.scale) * devicePixelRatio
    );

    return { x, y };
  }

  target.addEventListener("mousemove", (e) => {
    const { x, y } = posAtCoords(e.clientX, e.clientY);
    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  target.addEventListener("mouseleave", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });
}
