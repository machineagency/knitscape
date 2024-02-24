import { GLOBAL_STATE, dispatch } from "../state";
import { evaluateChart } from "../charting/evalChart";
import { bBoxAllBoundaries } from "../charting/helpers";

function debounce(callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

export function chartEvalSubscriber() {
  return () => {
    function evalChart() {
      const chart = evaluateChart(
        GLOBAL_STATE.boundaries,
        GLOBAL_STATE.regions,
        GLOBAL_STATE.stitchGauge,
        GLOBAL_STATE.rowGauge
      );
      dispatch({
        chart,
        yarnSequence: Array.from({ length: chart.height }, () => [0]),
        bbox: bBoxAllBoundaries(GLOBAL_STATE.boundaries),
      });
    }

    const debouncedEval = debounce(evalChart, 10);

    evalChart();

    return {
      syncState(state, changes) {
        const found = ["boundaries", "regions"].some((key) =>
          changes.includes(key)
        );

        if (found) {
          debouncedEval();
        }
      },
    };
  };
}
