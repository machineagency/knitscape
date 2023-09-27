export function outline({ inner = "#000000", outer = "#ffffff", canvas }) {
  return ({ state }) => {
    let { scale, pos, bitmap } = state;
    let width = null;
    let height = null;

    function sizeCanvas() {
      width = bitmap.width;
      height = bitmap.height;
      const canvasWidth = scale * width;
      const canvasHeight = scale * height;

      const cssWidth = canvasWidth / devicePixelRatio - devicePixelRatio;
      const cssHeight = canvasHeight / devicePixelRatio - devicePixelRatio;

      canvas.width = canvasWidth - 1;
      canvas.height = canvasHeight - 1;

      canvas.style.cssText = `width: ${cssWidth}px; height: ${cssHeight}`;
    }

    function draw() {
      const ctx = canvas.getContext("2d");
      ctx.resetTransform();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pos.x < 0 || pos.y < 0) return;
      ctx.translate(-0.5, -0.5);
      ctx.imageSmoothingEnabled = false;

      ctx.strokeStyle = outer;
      ctx.strokeRect(
        pos.x * scale + 1,
        pos.y * scale + 1,
        scale - 2,
        scale - 2
      );
      ctx.strokeStyle = inner;
      ctx.strokeRect(
        pos.x * scale + 2,
        pos.y * scale + 2,
        scale - 4,
        scale - 4
      );
    }

    sizeCanvas();

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.bitmap.width ||
          height != state.bitmap.height
        ) {
          scale = state.scale;
          bitmap = state.bitmap;
          sizeCanvas();
        }
        if (state.pos != pos) {
          pos = state.pos;

          draw();
        }
      },
    };
  };
}
