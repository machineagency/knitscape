function pan(startPos, state, dispatch) {
  const startPan = state.chartPan;
  function onMove(currentPos, { pan, scale }) {
    const dx = startPos.x - currentPos.x;
    const dy = startPos.y - currentPos.y;

    dispatch({ chartPan: { x: startPan.x - dx, y: startPan.y - dy } });
  }
  return onMove;
}

export const otherTools = { pan };
