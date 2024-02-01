import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { dispatch, GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
// import { chartTools } from "./chartTools";
import { debugPane } from "./debugPane";
import { sidebar } from "./sidebar";
import { repeatCanvas } from "./repeatCanvas";
import { editingTools } from "./editingTools";
import { operationPicker } from "./operationPicker";
// import { repeatTools } from "./repeatTools";

import { simulationView } from "../components/runSimulation";
import { shapeContextView } from "../contexts/shape/shapeContext";

function colorContextView() {
  return html` ${editingTools()}
    <div
      id="canvas-transform-group"
      style="transform: translate(${Math.floor(
        GLOBAL_STATE.chartPan.x
      )}px, ${Math.floor(GLOBAL_STATE.chartPan.y)}px);">
      <div id="yarn-sequence">
        <button id="color-dragger" class="btn solid grab">
          <i class="fa-solid fa-grip"></i>
        </button>
        <canvas id="yarn-sequence-canvas"></canvas>
      </div>
      <canvas id="yarn-color-canvas"></canvas>
      <canvas id="symbol-canvas"></canvas>
      <canvas id="grid" class="grid-canvas"></canvas>
      <!-- ${repeatCanvas()} -->
    </div>
    ${operationPicker()}`;
}

function textureContextView() {
  return html`<div>texture</div>`;
}

function processContextView() {
  return html`<div>process</div>`;
}

function currentContext() {
  if (GLOBAL_STATE.context == "shape") {
    return shapeContextView();
  } else if (GLOBAL_STATE.context == "color") {
    return colorContextView();
  } else if (GLOBAL_STATE.context == "texture") {
    return textureContextView();
  } else if (GLOBAL_STATE.context == "process") {
    return processContextView();
  } else {
    return html`<div>no context selected!</div>`;
  }
}

export function view() {
  return html`
    ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)} ${taskbar()}

    <div id="site">
      ${sidebar()}
      <div id="chart-pane">${currentContext()}</div>
      ${simulationView()}
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
