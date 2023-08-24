import { html, render } from "lit-html";

// function yarnEntry

export class YarnPane {
  constructor(parentEl, paneData, state, dispatch) {
    this.parentEl = parentEl;
    this.dispatch = dispatch;

    this.renderView(state);
  }

  view(state) {
    return html` <div>Yarn Library</div>
      <div class="yarn-library">
        ${state.yarns.map(
          (yarn) =>
            html`<div class="color-col">
                <input type="color" value=${yarn.hex} />
              </div>
              <div>${yarn.weight}</div>
              <div>${yarn.material}</div>`
        )}
      </div>`;
  }

  renderView(state) {
    render(this.view(state), this.parentEl);
  }

  sync(state) {}
}
