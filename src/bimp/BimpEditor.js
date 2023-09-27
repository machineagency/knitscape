import { Bimp } from "./Bimp";

const core = [];

function updateState(state, action) {
  return { ...state, ...action };
}

const defaultState = {
  bitmap: Bimp.empty(10, 10, 0),
  aspectRatio: [1, 1],
  scale: 1,
  pan: { x: 0, y: 0 },
  canvas: document.createElement("canvas"),
  palette: ["000000", "#ffffff"],
};

export class BimpEditor {
  constructor({ state, components = [], effects = {} }) {
    this.state = { ...defaultState, ...state };
    this.initialized = false;

    this.effects = effects;

    this.dispatch = (action) => {
      const changes = Object.keys(action);

      this.state = updateState(this.state, action);

      changes.forEach((key) => {
        if (key in this.effects) {
          this.effects[key].forEach((effect) => effect(this.state));
        }
      });

      this.syncState(this.state, changes);
    };

    this.components = core.concat(components.flat()).map((component) =>
      component({
        state: this.state,
        dispatch: this.dispatch,
      })
    );

    this.initialized = true;

    // tell components they've been attached to the DOM
    // This might be prone to breaking?
    this.components.forEach((component) => {
      if ("attached" in component) component.attached(this.state);
    });
  }

  addEffect(key, cb) {
    // should probably make an id and return it? to remove effects later
    this.effects[key] = [...(this.effects[key] || []), cb];
  }

  addComponent(component) {
    const newComponent = component({
      state: this.state,
      dispatch: this.dispatch,
    });
    this.components.push(newComponent);
    if ("attached" in component) component.attached(state);
  }

  syncState(state) {
    this.state = state;
    this.components.forEach((component) => {
      component.syncState(state);
    });
  }
}
