import { html, render } from "lit-html";
import { runSimulation } from "../stitchsim/Simulation";
import { Bimp } from "../bimp/bimp";

let timeoutID;

export class StitchSimPane {
  constructor(parentEl, paneData, state, dispatch) {
    this.parentEl = parentEl;
    this.dispatch = dispatch;
    this.currentTarget = [null, null];

    this.renderView(state);
    this.sim = null;
    this.endSim = null;
    this.mainYarn = "#F1C113";
    this.contrastYarn = "#1885d8";
    this.v = 30;
    this.h = 40;
  }

  view(state) {
    return html`<div class="sim-controls">
        <input
          type="color"
          value=${this.contrastYarn}
          @input=${(e) => {
            this.contrastYarn = e.target.value;
            this.sync(state);
          }} /><input
          type="color"
          value=${this.mainYarn}
          @input=${(e) => {
            this.mainYarn = e.target.value;
            this.sync(state);
          }} />
        <input
          type="number"
          value=${this.v}
          @input=${(e) => {
            this.v = Number(e.target.value);
            this.sync(state);
          }} />
        <input
          type="number"
          value=${this.h}
          @input=${(e) => {
            this.h = Number(e.target.value);
            this.sync(state);
          }} />
      </div>
      <div class="simcontainer"></div>`;
  }

  renderView(state) {
    render(this.view(state), this.parentEl);
  }

  runSim(state) {
    const target = state.simulation.currentTarget;

    if (this.endSim) this.endSim();

    this.endSim = null;

    this.endSim = runSimulation(
      state.simulation.PARAMS,
      Bimp.fromTile(this.v, this.h, state[target[0]][target[1]].bitmap),
      this.mainYarn,
      this.contrastYarn,
      this.repeatsVertical
    );
  }

  sync(state) {
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = setTimeout(() => this.runSim(state), 500);
  }
}
