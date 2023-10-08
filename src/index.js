import { render } from "lit-html";
import Split from "split.js";

import { StateMonitor } from "./state";

import { fitChart } from "./actions/zoomFit";

import { view } from "./views/view";

import { yarnSequenceCanvas } from "./components/yarnSequenceCanvas";

// Chart View Canvas Layers
import { drawYarnColors } from "./components/drawYarnColors";
import { drawSymbols } from "./components/drawSymbols";
import { drawGrid } from "./components/drawGrid";
import { drawOutline } from "./components/drawOutline";

import { drawRepeatLibrary } from "./components/drawRepeatLibrary";
import { drawRepeats } from "./components/drawRepeats";
import { resizeCanvases } from "./components/resizeCanvases";
import { runSimulation } from "./components/runSimulation";

import { addKeypressListeners } from "./events/keypressEvents";
import { wheelInteraction } from "./events/wheelInteraction";

import { drawSymbolPicker } from "./components/drawSymbolPicker";

import { chartPointerInteraction } from "./events/chartPointerInteraction";
import { colorSequencePointerInteraction } from "./events/colorSequencePointerInteraction";
import { repeatPointerInteraction } from "./events/repeatPointerInteraction";
import { simulationPointerInteraction } from "./events/simulationPointerInteraction";
import { repeatLibraryDragInteraction } from "./events/repeatLibraryDragInteraction";

import { chartTouchInteraction } from "./events/chartTouchInteraction";
import { colorSequenceTouchInteraction } from "./events/colorSequenceTouchInteraction";
import { repeatTouchInteraction } from "./events/repeatTouchInteraction";
import { simulationTouchInteraction } from "./events/simulationTouchInteraction";

import { closeModals } from "./events/closeModals";
import { generateChart } from "./components/generateChart";
import { isMobile } from "./utils";

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function initKeyboard() {
  addKeypressListeners();

  repeatPointerInteraction(document.getElementById("repeat-container"));
  chartPointerInteraction(document.getElementById("symbol-canvas"));
  wheelInteraction(document.getElementById("desktop"));
  colorSequencePointerInteraction(
    document.getElementById("yarn-sequence-canvas"),
    document.getElementById("color-dragger")
  );
  simulationPointerInteraction(document.getElementById("sim-container"));
  repeatLibraryDragInteraction(document.getElementById("repeat-library"));
  closeModals();
}

function initTouch() {
  document.body.style.setProperty("--font-size", "1.2rem");
  chartTouchInteraction(document.getElementById("symbol-canvas"));
  repeatTouchInteraction(document.getElementById("repeat-container"));
  colorSequenceTouchInteraction(
    document.getElementById("yarn-sequence-canvas"),
    document.getElementById("color-dragger")
  );
  simulationTouchInteraction(document.getElementById("sim-container"));
  repeatLibraryDragInteraction(document.getElementById("repeat-library"));
  closeModals();
}

function measureWindow() {
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`
  );
  document.documentElement.style.setProperty(
    "--vw",
    `${window.innerWidth * 0.01}px`
  );
}

function init() {
  r();

  Split(["#chart-pane", "#sim-pane"], {
    sizes: [60, 40],
    minSize: 100,
    gutterSize: 11,
  });

  isMobile() ? initTouch() : initKeyboard();

  const symbolCanvas = document.getElementById("symbol-canvas");
  const gridCanvas = document.getElementById("grid");
  const outlineCanvas = document.getElementById("outline");
  const yarnColorCanvas = document.getElementById("yarn-color-canvas");

  StateMonitor.register([
    resizeCanvases([symbolCanvas, gridCanvas, outlineCanvas, yarnColorCanvas]),
    yarnSequenceCanvas({
      canvas: document.getElementById("yarn-sequence-canvas"),
    }),
    drawSymbols(symbolCanvas),
    drawYarnColors(yarnColorCanvas),
    drawGrid(gridCanvas),
    drawOutline(outlineCanvas),
    drawRepeats(),
    drawRepeatLibrary(),
    drawSymbolPicker(),
    runSimulation(),
    generateChart(),
  ]);

  measureWindow();
  fitChart();
}

window.onload = init;
window.onresize = measureWindow;
