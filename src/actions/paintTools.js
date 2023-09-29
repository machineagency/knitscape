function brush(start, state, dispatch) {
  function onMove(newPos, state) {
    const updated = state.chart.line(
      { x: start.x, y: start.y },
      { x: newPos.x, y: newPos.y },
      state.activeSymbol
    );

    start = newPos;
    dispatch({ chart: updated });
  }

  onMove(start, state);
  return onMove;
}

function flood(start, state, dispatch) {
  function onMove({ x, y }, state) {
    dispatch({ chart: state.chart.flood({ x, y }, state.activeSymbol) });
  }

  onMove(start, state);
  return onMove;
}

function rect(start, state, dispatch) {
  // When we start to draw a rectangle, we save the currently active bitmap
  // so our changes will only be completely overriden when we stop dragging
  function onMove({ x, y }, _) {
    const updated = state.chart.rect(
      { x: start.x, y: start.y },
      { x, y },
      state.activeSymbol
    );

    dispatch({ chart: updated });
  }
  onMove(start);
  return onMove;
}

function line(start, state, dispatch) {
  function onMove({ x, y }) {
    dispatch({
      chart: state.chart.line(
        { x: start.x, y: start.y },
        { x, y },
        state.activeSymbol
      ),
    });
  }

  onMove(start);
  return onMove;
}

// function shift(start, state, dispatch) {
//   function onMove({ x, y }) {
//     dispatch({ chart: state.chart.shift(start.x - x, start.y - y) });
//   }
//   onMove(start);
//   return onMove;
// }

export const paintTools = { brush, flood, line, rect };
