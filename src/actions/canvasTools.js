import { GLOBAL_STATE, dispatch } from "../state";

function pan(startPos) {
  const startPan = GLOBAL_STATE.chartPan;
  function onMove(currentPos) {
    const dx = startPos.x - currentPos.x;
    const dy = startPos.y - currentPos.y;

    dispatch({ chartPan: { x: startPan.x - dx, y: startPan.y - dy } });
  }
  return onMove;
}

export const canvasTools = { pan };
