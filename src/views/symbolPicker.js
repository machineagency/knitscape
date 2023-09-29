import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { tools } from "../constants";
import { ifDefined } from "lit-html/directives/if-defined.js";

export function symbolPicker() {
  return html`<style>
      #symbol-picker {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #282828;
        gap: 4px;
        padding: 4px;
        box-shadow: 0 0 5px 0px black;
      }

      #symbol-picker-title > h4 {
        margin: 5px 0 5px 0;
      }

      #symbols-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .symbol {
        padding: 0;
        border: 1px solid black;
        background: white;
        color: #929292;
      }

      .symbol.current {
        outline: 1px solid white;
      }

      .symbol-img {
        width: 50px;
        height: 50px;
        display: block;
      }
    </style>
    <div id="symbol-picker">
      <!-- <div id="symbol-picker-title">
        <h4>Symbols</h4>
      </div> -->
      <div id="symbols-container">
        ${GLOBAL_STATE.symbolMap.map(
          (symbolName, index) => html`<button
            class="symbol ${GLOBAL_STATE.activeSymbol == index
              ? "current"
              : ""}"
            @click=${() => dispatch({ activeSymbol: index })}>
            <img
              class="symbol-img"
              src=${GLOBAL_STATE.symbolPalette[symbolName]
                ? GLOBAL_STATE.symbolPalette[symbolName].src
                : ""} />
          </button>`
        )}
      </div>
    </div>`;
}
