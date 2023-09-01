import { html, render } from "lit-html";
import { live } from "lit-html/directives/live.js";

function heightControlExtension() {
  function view({ bitmap }, dispatch) {
    return html`<style>
        .resize-control {
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          flex-direction: inherit;
          gap: 5px;
        }
        .control-group {
          display: flex;
        }
        .size-input {
          max-width: 40px;
        }
        .minus::before {
          content: "-";
        }
        .plus::before {
          content: "+";
        }
      </style>
      <span>Height</span>
      <div class="number-spinner">
        <button
          class="minus"
          @click=${() =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width, bitmap.height - 1),
            })}></button>
        <input
          type="number"
          .value=${live(bitmap.height)}
          class="size-input"
          @change=${(e) =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width, Number(e.target.value)),
            })} />
        <button
          class="plus"
          @click=${() =>
            dispatch({
              bitmap: bitmap.resize(bitmap.width, bitmap.height + 1),
            })}></button>
      </div>`;
  }
  return { view };
}

function controlPanelExtension(
  { state, parent, dispatch },
  { controls = [heightControl()], container = "sidebarPrimary" }
) {
  const dom = document.createElement("div");
  dom.style.flexDirection = "inherit";

  parent[container].appendChild(dom);

  function view() {
    return controls.map((control) => control.view(state, dispatch));
  }

  render(view(), dom);

  return {
    syncState(newState) {
      state = newState;
      render(view(), dom);
    },
  };
}

export function controls(options = {}) {
  return (config) => controlPanelExtension(config, options);
}
