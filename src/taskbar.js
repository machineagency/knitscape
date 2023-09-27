import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { map } from "lit-html/directives/map.js";
import { Bimp } from "./bimp/Bimp";
import { GLOBAL_STATE as state } from "./state";

const styles = html`<style>
  #taskbar {
    display: flex;
    background-color: #1a1919;
    justify-content: space-between;
    align-items: center;
    padding: 4px;
  }

  #taskbar button {
    border: 0;
    outline: 0;
    cursor: pointer;
  }

  #site-title {
    font-weight: 500;
    color: #dfdfdf;
    font-size: 20px;
    padding-left: 5px;
  }

  .btn-group {
    display: flex;
    gap: 5px;
  }

  .task-btn {
    position: relative;
  }

  .task-btn > button {
    background: none;
    padding: 0;
    color: #929292;
    border-radius: 4px;
    line-height: 0;
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

function upload(loadJSON) {
  let fileInputElement = document.createElement("input");

  fileInputElement.setAttribute("type", "file");
  fileInputElement.style.display = "none";

  document.body.appendChild(fileInputElement);
  fileInputElement.click();
  fileInputElement.onchange = (e) => {
    let file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = () => {
      loadJSON(JSON.parse(fileReader.result));
    };
  };
  document.body.removeChild(fileInputElement);
}

const fileMenuData = {
  New: {
    icon: "fa-file",
    action: (dispatch) => {
      dispatch({ showFileMenu: !state.showFileMenu });
    },
  },
  Upload: {
    icon: "fa-upload",
    action: (dispatch, loadJSON) => {
      upload(loadJSON);
      dispatch({ showFileMenu: !state.showFileMenu });
    },
  },
  Download: {
    icon: "fa-download",
    action: (dispatch) => {
      dispatch({ showDownload: true, showFileMenu: false });
    },
  },
};

function fileMenu(dispatch, loadJSON) {
  return html`<div id="file-menu" class="taskbar-dropdown">
    ${map(
      Object.entries(fileMenuData),
      ([key, data]) => html`<button
        class="drop-btn"
        @click=${() => data.action(dispatch, loadJSON)}>
        <i class="fa-solid ${data.icon}"></i>
        <span>${key}</span>
      </button>`
    )}
  </div>`;
}

function settings(dispatch) {
  return html`<div id="settings" class="taskbar-dropdown">
    <h3>Settings</h3>
  </div>`;
}

export function taskbar(dispatch, loadJSON) {
  return html`${styles}
    <div id="taskbar">
      <span id="site-title">KnitScape</span>
      <div class="btn-group">
        <div class="task-btn ${state.showFileMenu ? "open" : ""}">
          <button
            @click=${() => dispatch({ showFileMenu: !state.showFileMenu })}>
            <i class="fa-solid fa-folder"></i>
          </button>
          ${when(state.showFileMenu, () => fileMenu(dispatch, loadJSON))}
        </div>
        <div class="task-btn ${state.showLibrary ? "open" : ""}">
          <button @click=${() => dispatch({ showLibrary: !state.showLibrary })}>
            <i class="fa-solid fa-book"></i>
          </button>
        </div>
        <div class="task-btn ${state.showSettings ? "open" : ""}">
          <button
            @click=${() => dispatch({ showSettings: !state.showSettings })}>
            <i class="fa-solid fa-gear"></i>
          </button>
          ${when(state.showSettings, () => settings(dispatch))}
        </div>
      </div>
    </div>`;
}
