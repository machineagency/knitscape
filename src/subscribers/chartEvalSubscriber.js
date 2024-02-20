import { GLOBAL_STATE, dispatch } from "../state";
import { evaluateChart } from "../charting/evalChart";

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
        GLOBAL_STATE.regions
      );
      dispatch({
        chart,
        yarnSequence: Array.from({ length: chart.height }, () => [0]),
      });
    }

    const debouncedEval = debounce(evalChart, 30);

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
