import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { map } from "lit-html/directives/map.js";
import { GLOBAL_STATE, dispatch } from "../state";
import { uploadFile } from "../actions/importers";

const styles = html`<style>
  #taskbar {
    display: flex;
    background-color: #1a1919;
    justify-content: space-between;
    align-items: center;
    padding: 4px;
  }

  #site-title {
    font-weight: 500;
    color: #dfdfdf;
    font-size: 20px;
    padding-left: 5px;
  }

  .btn-group {
    display: flex;
  }

  .task-btn {
    position: relative;
  }

  .task-btn > button {
    background: none;
    line-height: 0;
    padding: 0;
    color: #929292;
    border-radius: 4px;
    height: 35px;
    width: 35px;
    font-size: x-large;
  }

  .task-btn.open > button {
    background-color: #3f3e3e;
    color: #b487bd;
  }

  .task-btn > button:hover {
    background-color: #333333;
  }

  .taskbar-dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    text-align: left;
    z-index: 100;
    background-color: #414141;
    display: flex;
    flex-direction: column;
    padding: 3px;
    line-height: 1;
    border-radius: 6px;
    box-shadow: 0 0 3px 0 black;
  }

  .drop-btn {
    background: none;
    color: #bdbdbd;
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 4px;
    border-radius: 5px;
    font-size: initial;
  }

  .drop-btn > i {
    font-size: large;
    width: 20px;
  }

  .drop-btn:hover {
    background-color: #535353;
    color: #f3f3f3;
  }
</style>`;

const fileMenuData = {
  New: {
    icon: "fa-file",
    action: () => {
      dispatch({ showFileMenu: !GLOBAL_STATE.showFileMenu });
    },
  },
  Upload: {
    icon: "fa-upload",
    action: () => {
      uploadFile();
      dispatch({ showFileMenu: !GLOBAL_STATE.showFileMenu });
    },
  },
  Download: {
    icon: "fa-download",
    action: () => {
      dispatch({ showDownload: true, showFileMenu: false });
    },
  },
};

function fileMenu() {
  return html`<div id="file-menu" class="taskbar-dropdown">
    ${map(
      Object.entries(fileMenuData),
      ([key, data]) => html`<button class="drop-btn" @click=${data.action}>
        <i class="fa-solid ${data.icon}"></i>
        <span>${key}</span>
      </button>`
    )}
  </div>`;
}

export function taskbar() {
  return html`${styles}
    <div id="taskbar">
      <span id="site-title">KnitScape</span>
      <div class="btn-group">
        <div class="task-btn ${GLOBAL_STATE.showFileMenu ? "open" : ""}">
          <button
            @click=${() =>
              dispatch({ showFileMenu: !GLOBAL_STATE.showFileMenu })}>
            <i class="fa-solid fa-folder"></i>
          </button>
          ${when(GLOBAL_STATE.showFileMenu, fileMenu)}
        </div>
        <div class="task-btn ${GLOBAL_STATE.showLibrary ? "open" : ""}">
          <button
            @click=${() =>
              dispatch({ showLibrary: !GLOBAL_STATE.showLibrary })}>
            <i class="fa-solid fa-book"></i>
          </button>
        </div>
        <div class="task-btn ${GLOBAL_STATE.showSettings ? "open" : ""}">
          <button
            @click=${() =>
              dispatch({ showSettings: !GLOBAL_STATE.showSettings })}>
            <i class="fa-solid fa-gear"></i>
          </button>
        </div>
        <div class="task-btn">
          <button
            @click=${() =>
              window.open("https://github.com/branchwelder/knitscape")}>
            <i class="fa-brands fa-github"></i>
          </button>
        </div>
      </div>
    </div>`;
}
