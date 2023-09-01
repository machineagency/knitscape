function scaledCanvasExtension({ state }, {}) {
  let { aspectRatio, scale, bitmap, canvas } = state;

  function updateDom() {
    canvas.width = bitmap.width * aspectRatio[0] * scale;
    canvas.height = bitmap.height * aspectRatio[1] * scale;
  }

  return {
    syncState(state) {
      if (
        state.aspectRatio[0] != aspectRatio[0] ||
        state.aspectRatio[1] != aspectRatio[1] ||
        state.scale != scale
      ) {
        ({ aspectRatio, scale, bitmap } = state);
        updateDom();
      }
    },
  };
}

export function scaledCanvas(options = {}) {
  return (config) => scaledCanvasExtension(config, options);
}
