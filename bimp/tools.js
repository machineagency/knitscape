export function brush(start, state, dispatch) {
  function onMove(newPos, state) {
    const updated = state.bitmap.line(
      { x: start.x, y: start.y },
      { x: newPos.x, y: newPos.y },
      state.paletteIndex
    );

    start = newPos;
    dispatch({ bitmap: updated });
  }

  onMove(start, state);
  return onMove;
}

export function flood(start, state, dispatch) {
  function onMove({ x, y }, state) {
    dispatch({ bitmap: state.bitmap.flood({ x, y }, state.paletteIndex) });
  }

  onMove(start, state);
  return onMove;
}

export function rect(start, state, dispatch) {
  // When we start to draw a rectangle, we save the currently active bitmap
  // so our changes will only be completely overriden when we stop dragging
  function onMove({ x, y }, _) {
    const updated = state.bitmap.rect(
      { x: start.x, y: start.y },
      { x, y },
      state.paletteIndex
    );

    dispatch({ bitmap: updated });
  }
  onMove(start);
  return onMove;
}

export function line(start, state, dispatch) {
  function onMove({ x, y }) {
    dispatch({
      bitmap: state.bitmap.line(
        { x: start.x, y: start.y },
        { x, y },
        state.paletteIndex
      ),
    });
  }

  onMove(start);
  return onMove;
}

export function shift(start, state, dispatch) {
  function onMove({ x, y }) {
    dispatch({ bitmap: state.bitmap.shift(start.x - x, start.y - y) });
  }
  onMove(start);
  return onMove;
}

export function pan(startPos, state, dispatch) {
  function onMove(currentPos, { pan, scale, aspectRatio }) {
    const dx = (startPos.x - currentPos.x) * scale * aspectRatio[0];
    const dy = (startPos.y - currentPos.y) * scale * aspectRatio[1];

    dispatch({ pan: { x: pan.x - dx, y: pan.y - dy } });
  }
  return onMove;
}
