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
      [0, 0],
      [0, 20],
      [10, 20],
      [10, 0],
    ],

    // [
    //   [5, 5],
    //   [5, 15],
    //   [10, 15],
    //   [10, 5],
    // ],
    // [
    //   [0, 0],
    //   [0, 4],
    //   [5, 4],
    //   [5, 0],
    // ],
  ],
  regions: [
    // {
    //   pos: [0, 0],
    //   yarnBlock: new Bimp(1, 1, [1]),
    //   stitchBlock: new Bimp(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 5]),
    // },
    {
      pos: [0, 0],
      yarnBlock: new Bimp(1, 1, [1]),
      stitchBlock: new Bimp(1, 1, [1]),
      joinMode: "tucks",
    },
    // {
    //   pos: [0, 0],
    //   yarnBlock: new Bimp(1, 1, [2]),
    //   stitchBlock: new Bimp(1, 1, [1]),
    // },
  ],
  blocks: [],
  paths: [
    {
      pts: [
        [2, 2],
        [5, 5],
        [3, 8],
      ],
      offset: [0, 0],
      yarnBlock: new Bimp(1, 1, [1]),
      stitchBlock: new Bimp(1, 1, [1]),
      tileMode: "continuous",
    },

    {
      pts: [
        [7, 7],
        [6, 12],
      ],
      offset: [-2, 0],
      yarnBlock: new Bimp(2, 2, [1, 1, 1, 1]),
      stitchBlock: new Bimp(2, 2, [1, 1, 1, 1]),
      tileMode: "continuous",
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
