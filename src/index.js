import Split from "split.js";
import { render } from "lit-html";

import { StateMonitor, dispatch } from "./state";
import { stitches } from "./constants";

import { runSimulation } from "./subscribers/runSimulation";
import { chartSubscriber } from "./subscribers/chartSubscriber";
import { blockSubscriber } from "./subscribers/blockSubscriber";
import { blockFillSubscriber } from "./subscribers/blockFillSubscriber";
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
  cellAspect: 7 / 11,
  yarnPalette: ["#df9e72ff", "#ebe9bbff"],
  boundaries: [
    [
      [0, 0],
      [0, 20],
      [15, 20],
      [15, 0],
    ],
    [
      [2, 2],
      [2, 18],
      [13, 18],
      [13, 2],
    ],
  ],
  regions: [
    {
      gap: [0, 0],
      pos: [0, 0],
      yarnBlock: new Bimp(1, 1, [0]),
      stitchBlock: new Bimp(1, 1, [1]),
    },
    {
      gap: [0, 0],
      pos: [5, 5],
      yarnBlock: new Bimp(1, 1, [1]),
      stitchBlock: new Bimp(4, 1, [1, 1, 1, 1]),
    },
  ],
  blocks: {},
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
    blockFillSubscriber(),
    runSimulation(),
  ]);

  measureWindow();

  setTimeout(() => fitChart());
}

window.onload = init;
window.onresize = measureWindow;
