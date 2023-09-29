import { html } from "lit-html";
import { loadLibraryPattern } from "../actions/importers";
import { GLOBAL_STATE } from "../state";

const styles = html`<style>
  #library-modal {
    min-width: 200px;
    max-width: 700px;
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

export function libraryModal() {
  return html`${styles}
    <div id="library-modal" class="modal">
      <h3>Pattern Library</h3>
      <div id="library-container">
        ${Object.entries(GLOBAL_STATE.patternLibrary).map(
          ([path, _]) =>
            html`<div class="library-item">
              <span>${path.split("/").at(-1).split(".")[0]}</span>
              <button @click=${() => loadLibraryPattern(path)}>
                <i class="fa-solid fa-upload"></i>
              </button>
            </div>`
        )}
      </div>
    </div>`;
}
