import { html, render } from "lit-html";

function toolboxExtension(
  { state, parent, dispatch },
  { tools, target = "workspace", container = "sidebarPrimary" }
) {
  state.activeTool = Object.keys(tools)[0];

  const layers = parent[target];

  layers.addEventListener("pointerdown", (e) => {
    let pos = state.pos;
    let tool = tools[state.activeTool];
    let onMove = tool(pos, state, dispatch);

    if (!onMove) return;

    let move = (moveEvent) => {
      if (moveEvent.buttons == 0) {
        layers.removeEventListener("mousemove", move);
      } else {
        let newPos = state.pos;
        if (newPos.x == pos.x && newPos.y == pos.y) return;
        onMove(state.pos, state);
        pos = newPos;
      }
    };
    layers.addEventListener("mousemove", move);
  });

  function view(state) {
    return html`<style>
        button {
          padding: 3px 8px;
          border: 0;
          outline: 0;
          border-radius: 4px;
          background-color: #252525;
          color: #9e9e9e;
          cursor: pointer;
        }
        button:hover {
          background-color: #676767;
        }

        .tool-container {
          display: flex;
          flex-direction: inherit;
          gap: 5px;
        }
        .active {
          background-color: #343434;
          color: #f1f1f1;
        }
      </style>
      <div class="tool-container">
        ${Object.keys(tools).map(
          (tool) =>
            html`<button
              class=${state.activeTool == tool ? "active" : ""}
              @click=${() => dispatch({ activeTool: tool })}>
              ${tool}
            </button>`
        )}
      </div>`;
  }

  if (container) {
    render(view(state), parent[container]);
  }
  return {
    syncState(newState) {
      state = newState;
      if (container) {
        render(view(state), parent[container]);
      }
    },
  };
}

export function toolbox(options = {}) {
  return (config) => toolboxExtension(config, options);
}
