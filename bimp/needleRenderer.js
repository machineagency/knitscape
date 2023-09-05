function draw(canvas, bitmap, needles, scale) {
  const ctx = canvas.getContext("2d");

  // ctx.clearRect(0, 0, bitmap.width * scale, bitmap.height * scale);
  ctx.fillStyle = "#0f0";
  const needleArr = needles.pixels;
  console.log(canvas);

  console.log(needleArr);
  for (let x = 0; x < bitmap.width; x++) {
    if (needleArr[x % needleArr.length] == 1) {
      console.log(x * scale, 0, scale, bitmap.height * scale);

      ctx.fillRect(x * scale, 0, scale, bitmap.height * scale);
    }
  }
  console.log(scale);

  ctx.fillRect(50, 50, 50, 50);
}

function needleRendererExtension({}, { canvas }) {
  let previous = null;
  let prevScale = null;

  return {
    syncState(state) {
      if (previous != state.needles || prevScale != state.scale) {
        draw(canvas, state.bitmap, state.needles, state.scale);
      }
      previous = state.needles;
      prevScale = state.scale;
    },
  };
}

export function needleRenderer(options = {}) {
  return (config) => needleRendererExtension(config, options);
}
