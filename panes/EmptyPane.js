import { html } from "lit-html";
import { render } from "lit-html";

export class EmptyPane {
  constructor(parentEl, paneData, state, dispatch) {
    this.parentEl = parentEl;
    this.dispatch = dispatch;

    this.renderView(state);
  }

  view(state) {
    return html`<div>There's nothing here!</div>
      <button @click=${() => this.dispatch("newMotif")}>new motif</button>`;
  }

  renderView(state) {
    render(this.view(this.dispatch), this.parentEl);
  }

  sync(state) {}
}
