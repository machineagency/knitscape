function brush(start, state, dispatch) {
  function onMove(newPos, state) {
    const updated = state.yarnSequence.line(
      { x: start.x, y: start.y },
      { x: newPos.x, y: newPos.y },
      state.activeYarn
    );

    start = newPos;
    dispatch({ yarnSequence: updated });
  }

  onMove(start, state);
  return onMove;
}

export const colorSequenceTools = { brush };
