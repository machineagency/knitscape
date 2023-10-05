import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { dispatch, GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { fileModal } from "./fileModal";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
import { repeatLibrary } from "./repeatLibrary";
import { debugPane } from "./debugPane";
import { bottomToolbar } from "./bottomToolbar";
import { leftBar } from "./leftBar";
import { repeatCanvas } from "./repeatCanvas";
import { Bimp } from "../lib/Bimp";

import { simulationView } from "../components/runSimulation";

export function view() {
  return html`
    ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)}
    ${when(GLOBAL_STATE.showFileMenu, fileModal)}
    <div id="site">
      <div id="chart-pane">
        ${taskbar()}

        <div id="chart-layout">
          ${leftBar()}

          <div id="desktop">
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
              <canvas id="outline" class="outline-canvas"></canvas>
              ${repeatCanvas()}
            </div>
          </div>
          ${repeatLibrary()}
        </div>

        ${bottomToolbar()}
      </div>
      ${simulationView()}
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
