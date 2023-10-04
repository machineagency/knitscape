import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { dispatch, GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { fileModal } from "./fileModal";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
import { debugPane } from "./debugPane";
import { pointerIcon } from "./pointerIcon";
import { toolPicker } from "./toolPicker";
import { bottomToolbar } from "./bottomToolbar";
import { leftBar } from "./leftBar";
import { repeatCanvas } from "./repeatCanvas";

export function view() {
  return html`
    ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)}
    ${when(GLOBAL_STATE.showFileMenu, fileModal)}
    <div id="site">
      ${pointerIcon()}
      <div id="chart-pane">
        ${taskbar()}

        <div id="chart-layout">
          ${leftBar()}

          <div id="desktop">
            ${toolPicker()}
            <div
              id="canvas-transform-group"
              style="transform: translate(${GLOBAL_STATE.chartPan
                .x}px, ${GLOBAL_STATE.chartPan.y}px);">
              <div id="yarn-sequence">
                <button id="color-dragger" class="btn solid grab">
                  <i class="fa-solid fa-grip"></i>
                </button>
                <canvas id="yarn-sequence-canvas"></canvas>
              </div>
              <canvas id="yarn-color-canvas"></canvas>
              <canvas id="chart"></canvas>

              <canvas id="grid"></canvas>
              <canvas id="outline"></canvas>
              ${repeatCanvas()}
            </div>
          </div>
        </div>

        ${bottomToolbar()}
      </div>
      <div id="sim-pane"></div>
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
