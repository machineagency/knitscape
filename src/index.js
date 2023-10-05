import { render } from "lit-html";
import Split from "split.js";

import { StateMonitor } from "./state";

import { fitChart } from "./actions/zoomFit";

import { view } from "./views/view";

import { DEFAULT_SYMBOLS, SYMBOL_DIR } from "./constants";

import { yarnSequenceCanvas } from "./components/yarnSequenceCanvas";

// Chart View Canvas Layers
import { drawYarnColors } from "./components/drawYarnColors";
import { drawSymbols } from "./components/drawSymbols";
import { drawGrid } from "./components/drawGrid";
import { drawOutline } from "./components/drawOutline";

import { drawRepeats } from "./components/drawRepeats";
import { resizeCanvases } from "./components/resizeCanvases";

import { addKeypressListeners } from "./events/keypressEvents";
import { wheelInteraction } from "./events/wheelInteraction";

import { drawSymbolPicker } from "./components/drawSymbolPicker";
// import { addPointerIcon } from "./events/addPointerIcon";

import { chartPointerInteraction } from "./events/chartPointerInteraction";
import { colorSequencePointerInteraction } from "./events/colorSequencePointerInteraction";
import { repeatPointerInteraction } from "./events/repeatPointerInteraction";

import { chartTouchInteraction } from "./events/chartTouchInteraction";
import { colorSequenceTouchInteraction } from "./events/colorSequenceTouchInteraction";
import { repeatTouchInteraction } from "./events/repeatTouchInteraction";

import { closeModals } from "./events/closeModals";

import { isMobile } from "./utils";

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function initKeyboard() {
  addKeypressListeners();
  // addPointerIcon(
  //   document.getElementById("pointer"),
  //   document.getElementById("chart")
  // );
  repeatPointerInteraction(document.getElementById("repeat-container"));
  chartPointerInteraction(document.getElementById("chart"));
  wheelInteraction(document.getElementById("desktop"));
  colorSequencePointerInteraction(
    document.getElementById("yarn-sequence-canvas"),
    document.getElementById("color-dragger")
  );
  closeModals();
}

function initTouch() {
  document.body.style.setProperty("--font-size", "1.2rem");
  chartTouchInteraction(document.getElementById("chart"));
  repeatTouchInteraction(document.getElementById("repeat-container"));
  colorSequenceTouchInteraction(
    document.getElementById("yarn-sequence-canvas"),
    document.getElementById("color-dragger")
  );
  closeModals();
}

function calcSplit() {
  const portrait = screen.availHeight > screen.availWidth;
  document
    .getElementById("site")
    .style.setProperty("flex-direction", portrait ? "column" : "row");

  return portrait
    ? Split(["#chart-pane", "#sim-pane"], {
        sizes: [90, 10],
        minSize: 100,
        gutterSize: 11,
        direction: "vertical",
      })
    : Split(["#chart-pane", "#sim-pane"], {
        sizes: [90, 10],
        minSize: 100,
        gutterSize: 11,
      });
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

  calcSplit();

  isMobile() ? initTouch() : initKeyboard();

  const symbolCanvas = document.getElementById("chart");
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
    drawSymbolPicker(),
  ]);

  measureWindow();
  fitChart();
}

window.onload = init;
window.onresize = measureWindow;
