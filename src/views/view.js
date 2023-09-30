import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE } from "../state";

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

export function view() {
  return html`
    ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)}
    ${when(GLOBAL_STATE.showFileMenu, fileModal)}
    <style>
      #chart {
        background: ${GLOBAL_STATE.chartBackground};
      }
    </style>
    <div id="site">
      <div id="chart-pane">
        ${taskbar()}

        <div id="chart-layout">
          ${leftBar()}

          <div id="desktop">
            ${pointerIcon()} ${toolPicker()}
            <div id="available">
              <div
                id="canvas-transform-group"
                style="transform: translate(${GLOBAL_STATE.chartPan
                  .x}px, ${GLOBAL_STATE.chartPan.y}px);">
                <canvas id="chart"></canvas>
                <canvas id="grid"></canvas>
                <canvas id="outline"></canvas>
              </div>
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
