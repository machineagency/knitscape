import Split from "split.js";
import { render } from "lit-html";

import { StateMonitor } from "./state";

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

// const testWorkspace = {
//   cellAspect: 7 / 11,
//   yarnPalette: ["#df9e72ff", "#ebe9bbff", "#5fb6e9ff"],
//   boundaries: [
//     [
//       [0, 0],
//       [0, 100],
//       [60, 100],
//       [60, 0],
//     ],
//     [
//       [20, 20],
//       [20, 80],
//       [40, 80],
//       [40, 20],
//     ],
//     [
//       [40, 20],
//       [40, 80],
//       [60, 80],
//       [60, 20],
//     ],

//   ],
//   regions: [
//     {
//       gap: [0, 0],
//       pos: [0, 0],
//       yarnBlock: new Bimp(1, 1, [1]),
//       stitchBlock: new Bimp(1, 1, [1]),
//     },
//     {
//       gap: [0, 0],
//       pos: [20,20],
//       yarnBlock: new Bimp(1, 1, [2]),
//       stitchBlock: new Bimp(1, 1, [1]),
//     },
//     {
//       gap: [0, 0],
//       pos: [40,20],
//       yarnBlock: new Bimp(1, 1, [3]),
//       stitchBlock: new Bimp(1, 1, [1]),
//     },
//   ],
//   blocks: {},
// };

const testWorkspace = {
  cellAspect: 7 / 11,
  yarnPalette: ["#df9e72ff", "#ebe9bbff", "#5fb6e9ff"],
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
      yarnBlock: new Bimp(2, 2, [1, 1, 0, 1]),
      stitchBlock: new Bimp(1, 1, [1]),
    },
    {
      gap: [0, 0],
      pos: [2, 2],
      yarnBlock: new Bimp(
        4,
        4,
        [3, 3, 2, 2, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]
      ),
      stitchBlock: new Bimp(1, 1, [1]),
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
