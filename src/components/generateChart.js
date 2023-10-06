import { GLOBAL_STATE, dispatch } from "../state";
import { Bimp } from "../lib/Bimp";
export function generateChart() {
  return ({ state }) => {
    let repeats = state.repeats;
    function regen() {
      let chart = Bimp.empty(
        GLOBAL_STATE.chart.height,
        GLOBAL_STATE.chart.width,
        0
      );
      for (const repeat of repeats) {
        let tiled = Bimp.fromTile(
          repeat.bitmap.width + repeat.xRepeats,
          repeat.bitmap.height + repeat.yRepeats,
          repeat.bitmap.vFlip()
        ).vFlip();
        chart = chart.overlay(tiled, repeat.pos);
      }
      dispatch({ chart });
    }
    regen();
    return {
      syncState(state) {
        if (repeats != state.repeats) {
          repeats = state.repeats;
          regen();
        }
      },
    };
  };
}
