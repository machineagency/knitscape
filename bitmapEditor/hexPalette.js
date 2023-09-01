function hexPaletteExtension(
  { entries, showSelect = true, selectSize = "30px" },
  { state, dispatch }
) {
  let selected = state.paletteIndex;
  let dom = document.createElement("div");
  dom.style.flexDirection = "inherit";

  function renderSelection() {
    if (!showSelect) return;
    render(
      html`<style>
          .palette-select {
            display: flex;
            flex-direction: inherit;
            gap: 3px;
            padding: 3px;
          }
          .palette-select > div {
            border: 1px solid black;
            min-width: ${selectSize};
            aspect-ratio: 1;
          }
          .selected {
            outline: 1px solid white;
          }
        </style>
        <div class="palette-select">
          ${entries.map(
            (hex, index) =>
              html`<div
                class=${index == selected ? "selected" : ""}
                style="background-color: ${hex}"
                @click=${() => dispatch({ paletteIndex: index })}></div>`
          )}
        </div> `,
      dom
    );
  }

  function draw(paletteIndex, ctx, width, height) {
    ctx.fillStyle = entries[paletteIndex];
    ctx.fillRect(0, 0, width, height);
  }

  function syncState({ paletteIndex }) {
    if (selected != paletteIndex) {
      selected = paletteIndex;
      renderSelection();
    }
  }

  renderSelection();

  return {
    draw,
    dom,
    syncState,
  };
}

export function hexPalette(entries) {
  return (config) => hexPaletteExtension({ entries }, config);
}
