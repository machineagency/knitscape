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

function scaledCanvasExtension(
  { state, dispatch },
  { measureFunc = measureParent }
) {
  let { canvas } = state;
  let width, height;

  // function updateDom(state) {
  //   canvas.width = state.bitmap.width * state.aspectRatio[0] * state.scale;
  //   canvas.height = state.bitmap.height * state.aspectRatio[1] * state.scale;
  // }

  function pixelPerfectScale(state) {
    const newScale = measureFunc(state);

    canvas.width = state.bitmap.width * state.aspectRatio[0] * newScale;
    canvas.height = state.bitmap.height * state.aspectRatio[1] * newScale;
    // setTimeout(() => pixelPerfectScale(state), 1);

    dispatch({ scale: newScale });
  }

  return {
    // attached(state) {
    //   scale = state.scale;
    //   width = state.bitmap.width;
    //   height = state.bitmap.height;
    //   updateDom(state);
    // },
    attached(state) {
      setTimeout(() => pixelPerfectScale(state), 1);
    },
    syncState(state) {
      if (state.bitmap.width != width || state.bitmap.height != height) {
        width = state.bitmap.width;
        height = state.bitmap.height;
        setTimeout(() => pixelPerfectScale(state), 1);
      }
    },
  };
}

export function scaledCanvas(options = {}) {
  return (config) => scaledCanvasExtension(config, options);
}
