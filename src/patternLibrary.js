import { html } from "lit-html";

import { GLOBAL_STATE as state } from "./state";
const library = import.meta.glob("../patterns/*.json");

function load(path, dispatch, loadJSON) {
  dispatch({ showLibrary: false });
  library[path]().then((mod) => loadJSON(mod));
}

const styles = html`<style>
  #library-modal {
    position: absolute;
    margin: 100px;
    align-self: center;
    min-width: 200px;
    max-width: 700px;
    z-index: 100000;
    background-color: #252525;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px 3px #0000009e;
  }

  #library-modal > h3 {
    margin: 0 0 10px 0;
  }

  #library-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  .library-item > button {
    outline: 0;
    border: 0;
    padding: 4px;
    font-size: inherit;
    border-radius: 4px;
    font-family: "National Park";
    background-color: #363636;
    box-shadow: 0 0 2px 0 black;
    color: #bdbdbd;
    cursor: pointer;
  }

  .library-item > button:hover {
    background-color: #535353;
    color: #e4e4e4;
  }
</style>`;

export function patternLibrary(dispatch, loadJSON) {
  return html`${styles}
    <div id="library-modal">
      <h3>Pattern Library</h3>
      <div id="library-container">
        ${Object.entries(library).map(
          ([path, _]) =>
            html`<div class="library-item">
              <span>${path.split("/").at(-1).split(".")[0]}</span>
              <button @click=${() => load(path, dispatch, loadJSON)}>
                <i class="fa-solid fa-upload"></i>
              </button>
            </div>`
        )}
      </div>
    </div>`;
}
