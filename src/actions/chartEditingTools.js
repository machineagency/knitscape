import { GLOBAL_STATE, dispatch } from "../state";

function brush(startPos) {
  function onMove(newPos) {
    const updatedChart = GLOBAL_STATE.chart.line(
      { x: startPos.x, y: startPos.y },
      { x: newPos.x, y: newPos.y },
      GLOBAL_STATE.activeSymbol
    );
    startPos = newPos;
    dispatch({ chart: updatedChart });
  }

  onMove(startPos);
  return onMove;
}

function flood(startPos) {
  function onMove(newPos) {
    dispatch({
      chart: GLOBAL_STATE.chart.flood(newPos, GLOBAL_STATE.activeSymbol),
    });
  }

  onMove(startPos);
  return onMove;
}

function rect(startPos) {
  const startChart = GLOBAL_STATE.chart;

  function onMove(newPos) {
    dispatch({
      chart: startChart.rect(
        { x: startPos.x, y: startPos.y },
        { x: newPos.x, y: newPos.y },
        GLOBAL_STATE.activeSymbol
      ),
    });
  }
  onMove(startPos);
  return onMove;
}

function line(startPos) {
  const startChart = GLOBAL_STATE.chart;
  function onMove(newPos) {
    dispatch({
      chart: startChart.line(
        { x: startPos.x, y: startPos.y },
        { x: newPos.x, y: newPos.y },
        GLOBAL_STATE.activeSymbol
      ),
    });
  }

  onMove(startPos);
  return onMove;
}

function shift(startPos) {
  const startChart = GLOBAL_STATE.chart;

  function onMove(newPos) {
    dispatch({
      chart: startChart.shift(startPos.x - newPos.x, startPos.y - newPos.y),
    });
  }
  onMove(startPos);
  return onMove;
}

export const chartEditingTools = { brush, flood, line, rect, shift };
