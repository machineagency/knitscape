import Split from "split.js";
import { render } from "lit-html";

import { StateMonitor, dispatch } from "./state";
import { stitches } from "./constants";

import { runSimulation } from "./subscribers/runSimulation";
import {
  chartSubscriber,
  blockSubscriber,
} from "./subscribers/chartSubscriber";
import { chartEvalSubscriber } from "./subscribers/chartEvalSubscriber";

import { globalKeydown, globalKeyup } from "./interaction/globalKeypress";

import { loadWorkspace } from "./utilities/importers";
import { measureWindow } from "./utilities/misc";
import { fitChart } from "./interaction/chartPanZoom";
import { Bimp } from "./lib/Bimp";

import { mainView } from "./views/mainView";

function r() {
  render(mainView(), document.body);
  window.requestAnimationFrame(r);
}

const testWorkspace = {
  boundaries: [
    [
      [0, 0],
      [0, 20],
      [15, 20],
      [15, 0],
    ],
  ],
  regions: [
    {
      fillType: "block",
      stitch: stitches.KNIT,
      blockID: "rib_2x1",
      gap: [0, 0],
    },
  ],
  yarnRegions: [{ bitmap: new Bimp(1, 4, [0, 0, 1, 1]), pos: [0, 0] }],
  blocks: {
    rib_2x1: {
      type: "stitch",
      pos: [0, 0],
      bitmap: new Bimp(4, 1, [2, 2, 1, 1]),
    },
  },
  cellAspect: 7 / 11,
  stitchGauge: 7, // stitches per inch
  rowGauge: 11, // rows per inch
  yarnPalette: ["#df9e72ff", "#ebe9bbff"],
};

function init() {
  loadWorkspace(testWorkspace);

  r();

  Split(["#chart-pane", "#sim-pane"], {
    sizes: [60, 40],
    minSize: 100,
    gutterSize: 11,
  });

  window.addEventListener("keydown", globalKeydown);
  window.addEventListener("keyup", globalKeyup);

  StateMonitor.requestRender = () => render(mainView(), document.body);

  StateMonitor.register([
    chartEvalSubscriber(),
    chartSubscriber(),
    blockSubscriber(),
    runSimulation(),
  ]);

  measureWindow();

  setTimeout(() => fitChart());
}

window.onload = init;
window.onresize = measureWindow;
