function measureParent({ canvas, aspectRatio, bitmap }) {
  // Caluculates the nearest whole-pixel scale multiplier that will
  // fit this bitmap at the current aspect ratio.
  // There will likely be some padding around the edges - but
  // the canvas can get blurry when dealing with sub-pixels.
  const bbox = canvas.parentElement.getBoundingClientRect();

  const availableWidth = bbox.width;
  const availableHeight = bbox.height;

  return Math.min(
    Math.floor(availableWidth / (bitmap.width * aspectRatio[0])),
    Math.floor(availableHeight / (bitmap.height * aspectRatio[1]))
  );
}

function pixelPerfectCanvasExtension(
  { state, dispatch },
  { measureFunc = measureParent }
) {
  let { bitmap } = state;

  function pixelPerfectScale() {
    const newScale = measureFunc(state);
    dispatch({ scale: newScale });
  }

  return {
    attached() {
      setTimeout(() => pixelPerfectScale(), 1);
    },
    syncState(state) {
      if (
        state.bitmap.width != bitmap.width ||
        state.bitmap.height != bitmap.height
      ) {
        ({ bitmap } = state);

        setTimeout(() => pixelPerfectScale(), 1);
        return;
      }
    },
  };
}

export function pixelPerfectCanvas(options = {}) {
  return (config) => pixelPerfectCanvasExtension(config, options);
}
