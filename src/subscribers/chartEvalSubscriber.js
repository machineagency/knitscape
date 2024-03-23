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
      const { boundaries, regions, blocks, paths } = GLOBAL_STATE;

      let { stitchChart, yarnChart, machineChart, yarnSequence, rowMap } =
        evaluateChart(boundaries, regions, blocks, paths);

      dispatch({
        chart: stitchChart,
        yarnChart,
        machineChart,
        yarnSequence,
        rowMap,
        bbox: bBoxAllBoundaries(boundaries),
      });
    }

    const debouncedEval = debounce(evalChart, 30);

    evalChart();

    return {
      syncState(state, changes) {
        const found = ["boundaries", "regions", "blocks", "paths"].some((key) =>
          changes.includes(key)
        );

        if (found) {
          debouncedEval();
        }
      },
    };
  };
}
