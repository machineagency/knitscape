import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";
import { centerZoom, zoomAtPoint } from "../actions/zoomFit";

export function desktopTouchPanZoom(desktop) {
  const pointerCache = [];
  let prevDiff = -1;
  let didZoom = false;

  function pan(e, target) {
    if (didZoom) return;
    const startPos = { x: e.clientX, y: e.clientY };
    const startPan = GLOBAL_STATE.chartPan;

    function move(e) {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;

      dispatch({ chartPan: { x: startPan.x - dx, y: startPan.y - dy } });
    }

    function end() {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointercancel", end);
      target.removeEventListener("pointerleave", end);
      target.removeEventListener("pointerout", end);
    }

    target.addEventListener("pointermove", move);
    target.addEventListener("pointercancel", end);
    target.addEventListener("pointerleave", end);
    target.addEventListener("pointerout", end);
  }

  desktop.addEventListener("pointerdown", (e) => {
    pointerCache.push(e);
  });

  desktop.addEventListener("touchstart", (e) => {
    const { x, y } = posAtCoords(e, desktop);

    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }

    if (e.target == desktop || e.target.id == "symbol-canvas") {
      dispatch({ editingRepeat: -1 });
      pan(e.touches[0], desktop);
    }
  });

  desktop.addEventListener("touchmove", (e) => {
    const { x, y } = posAtCoords(e, desktop);

    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  desktop.addEventListener("pointermove", (e) => {
    if (pointerCache.length === 0) return;

    const pointerIndex = pointerCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId
    );
    pointerCache[pointerIndex] = e;

    if (pointerCache.length === 2) {
      didZoom = true;
      const curDiff = Math.abs(
        pointerCache[0].clientX - pointerCache[1].clientX
      );

      let scale = GLOBAL_STATE.scale;

      if (prevDiff > 0) {
        if (curDiff > prevDiff) {
          // The distance between the two pointers has increased
          scale--;
        }
        if (curDiff < prevDiff) {
          // The distance between the two pointers has decreased
          scale++;
        }
      }

      centerZoom(scale);

      // Cache the distance for the next move event
      prevDiff = curDiff;
    }
  });

  desktop.addEventListener("pointerup", (e) => {
    const pointerIndex = pointerCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId
    );
    pointerCache.splice(pointerIndex, 1);
    if (pointerCache.length === 0) {
      didZoom = false;
    }
    if (pointerCache.length < 2) {
      prevDiff = -1;
    }
  });
}
