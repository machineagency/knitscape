import { html, render } from "lit-html";
import { pointerTracker } from "./pointerPosition";
import { Bimp } from "./Bimp";

const core = [pointerTracker()];

function updateState(state, action) {
  return { ...state, ...action };
}

function defaultLayout(parent) {
  render(
    html`<style>
        .bimp-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          flex: 1 1 0;
        }
        .bimp-center {
          display: flex;
          flex: 1 0 0;
          gap: 5px;
        }
        .bimp-workspace {
          display: grid;
          flex: 1 1 0;
          gap: 1px;
          grid-template-areas:
            ". top ."
            "left c right"
            ". bottom .";
          overflow: hidden;
          grid-template-columns: min-content 1fr min-content;
          grid-template-rows: min-content 1fr min-content;
          /* outline: 1px solid black; */
          background-color: #222222;

          flex: 1 1 0;
          min-height: 0;
          min-width: 0;
        }

        .bimp-workspace > * {
          position: relative;
        }

        .bimp-desktop > * {
          position: absolute;
          flex: 1 1 0;
        }
        .bimp-sidebar-primary,
        .bimp-sidebar-secondary {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px;
        }
        .bimp-taskbar-primary,
        .bimp-taskbar-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          gap: 5px;
        }
      </style>
      <div class="bimp-container">
        <div class="bimp-taskbar-primary"></div>
        <div class="bimp-center">
          <div class="bimp-sidebar-primary"></div>
          <div class="bimp-workspace">
            <div class="bimp-desktop"></div>
          </div>
          <div class="bimp-sidebar-secondary"></div>
        </div>
        <div class="bimp-taskbar-secondary"></div>
      </div>`,
    parent
  );

  return {
    container: parent.querySelector(":scope .bimp-container"),
    workspace: parent.querySelector(":scope .bimp-workspace"),
    desktop: parent.querySelector(":scope .bimp-desktop"),
    sidebarPrimary: parent.querySelector(":scope .bimp-sidebar-primary"),
    sidebarSecondary: parent.querySelector(":scope .bimp-sidebar-secondary"),
    taskbarPrimary: parent.querySelector(":scope .bimp-taskbar-primary"),
    taskbarSecondary: parent.querySelector(":scope .bimp-taskbar-secondary"),
  };
}

const defaultState = {
  bitmap: Bimp.empty(10, 10, 0),
  aspectRatio: [1, 1],
  scale: 1,
  pan: { x: 0, y: 0 },
};

export class BimpEditor {
  constructor({ state, parent, components, buildLayout = defaultLayout }) {
    this.state = state;
    this.initialized = false;

    this.dispatch = (action) => {
      const changes = Object.keys(action);

      state = updateState(state, action);

      this.syncState(state, changes);
    };

    this.dom = buildLayout(parent);

    this.components = core.concat(components.flat()).map((component) =>
      component({
        state,
        parent: this.dom,
        dispatch: this.dispatch,
      })
    );

    parent.appendChild(this.dom["container"]);
    this.initialized = true;

    // tell components they've been attached to the DOM
    // This might be prone to breaking?
    this.components.forEach((component) => {
      if ("attached" in component) component.attached(state);
    });
  }

  addComponent(component) {
    const newComponent = component({
      state: this.state,
      parent: this.dom,
      dispatch: this.dispatch,
    });
    this.components.push(newComponent);
    if ("attached" in component) component.attached(state);
  }

  syncState(state, changes) {
    this.state = state;
    this.components.forEach((component) => {
      component.syncState(state);
    });
  }
}
