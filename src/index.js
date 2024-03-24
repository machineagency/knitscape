import Split from "split.js";
import { render } from "lit-html";

import { StateMonitor } from "./state";

import { runSimulation } from "./subscribers/runSimulation";
import { chartSubscriber } from "./subscribers/chartSubscriber";
import { blockSubscriber } from "./subscribers/blockSubscriber";
import { blockFillSubscriber } from "./subscribers/blockFillSubscriber";
import { chartEvalSubscriber } from "./subscribers/chartEvalSubscriber";
import { pathTileSubscriber } from "./subscribers/pathTileSubscriber";

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
  yarnPalette: ["#7babc7ff", "#ebe9bbff"],
  boundaries: [
    [
      [20, 0],
      [20, 30],
      [25, 30],
      [30, 12],
      [30, 0],
    ],
  ],
  regions: [
    {
      pos: [0, 0],
      yarnBlock: new Bimp(1, 1, [1]),
      stitchBlock: new Bimp(1, 1, [1]),
      joinMode: "tucks",
    },
  ],
  blocks: [],
  paths: [
    {
      pts: [
        [30, 12],
        [25, 30],
      ],
      offset: [-1, -1],
      yarnBlock: new Bimp(1, 1, [0]),
      stitchBlock: new Bimp(2, 1, [2, 2]),
      tileMode: "step",
    },
  ],
};

function init() {
  loadWorkspace(testWorkspace);

  r();

  Split(["#chart-pane", "#sim-pane"], {
    sizes: [70, 30],
    minSize: 100,
    gutterSize: 8,
  });

  window.addEventListener("keydown", globalKeydown);
  window.addEventListener("keyup", globalKeyup);

  StateMonitor.requestRender = () => render(mainView(), document.body);

  StateMonitor.register([
    chartEvalSubscriber(),
    chartSubscriber(),
    blockSubscriber(),
    blockFillSubscriber(),
    pathTileSubscriber(),
    runSimulation(),
  ]);

  measureWindow();

  setTimeout(() => fitChart());
}

window.onload = init;
window.onresize = measureWindow;
