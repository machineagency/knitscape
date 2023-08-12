import { html, render } from "lit-html";
import { renderPreview } from "../stitchsim/StitchPreview";
import { Bimp } from "../bimp";

let timeoutID;

export class PreviewPane {
  constructor(parentEl, paneData, state, dispatch) {
    this.parentEl = parentEl;
    this.dispatch = dispatch;
    this.currentTarget = [null, null];

    this.renderView(state);
    this.sim = null;
    this.clear = null;
    this.relax = null;
    this.mainYarn = "#F1C113";
    this.contrastYarn = "#1885d8";
    this.v = 45;
    this.h = 70;
  }

  view(state) {
    return html`<div class="sim-controls">
        <input
          type="color"
          value=${this.mainYarn}
          @input=${(e) => {
            this.mainYarn = e.target.value;
            this.sync(state);
          }} />
        <input
          type="color"
          value=${this.contrastYarn}
          @input=${(e) => {
            this.contrastYarn = e.target.value;
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
        <button @click=${(e) => this.relax()}>Relax</button>
      </div>
      <div class="simcontainer">
        <svg
          width="100%"
          height="auto"
          viewBox="0 0 1200 1200"
          id="swatch-preview"></svg>
      </div>`;
  }

  renderView(state) {
    render(this.view(state), this.parentEl);
  }

  updatePreview(state) {
    const target = state.simulation.currentTarget;

    if (this.clear) this.clear();

    this.clear = null;

    let { clear, relax } = renderPreview(
      state.simulation.PARAMS,
      Bimp.fromTile(this.v, this.h, state[target[0]][target[1]].bitmap),
      this.mainYarn,
      this.contrastYarn,
      this.repeatsVertical
    );
    this.clear = clear;
    this.relax = relax;
  }

  sync(state) {
    // this.updatePreview(state);
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = setTimeout(() => this.updatePreview(state), 70);
  }
}
