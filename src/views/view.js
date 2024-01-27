import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { dispatch, GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
import { chartTools } from "./chartTools";
import { debugPane } from "./debugPane";
import { leftBar } from "./leftBar";
import { repeatCanvas } from "./repeatCanvas";
import { editingTools } from "./editingTools";
import { operationPicker } from "./operationPicker";
// import { repeatTools } from "./repeatTools";

import { simulationView } from "../components/runSimulation";

// ${when(GLOBAL_STATE.editingRepeat > -1, repeatTools)}

export function view() {
  return html`
    ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)} ${taskbar()}

    <div id="site">
      <div id="chart-pane">
        <div id="chart-layout">
          ${leftBar()}
          <div id="desktop">
            ${editingTools()}
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
              ${repeatCanvas()}
            </div>
          </div>
        </div>
        ${operationPicker()}
      </div>
      ${simulationView()}
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
