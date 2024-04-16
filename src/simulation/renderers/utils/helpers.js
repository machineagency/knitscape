export function bbox3d(points) {
  let xMin = Infinity;
  let xMax = -Infinity;

  let yMin = Infinity;
  let yMax = -Infinity;

  let zMin = Infinity;
  let zMax = -Infinity;

  for (let i = 0; i < points.length; i += 3) {
    xMin = Math.min(points[i], xMin);
    xMax = Math.max(points[i], xMax);

    yMin = Math.min(points[i + 1], yMin);
    yMax = Math.max(points[i + 1], yMax);

    zMin = Math.min(points[i + 2], zMin);
    zMax = Math.max(points[i + 2], zMax);
  }

  let width = Math.abs(xMax - xMin);
  let height = Math.abs(yMax - yMin);
  let depth = Math.abs(zMax - zMin);

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    zMin,
    zMax,
    dimensions: [width, height, depth],
    center: [xMin + width / 2, yMin + height / 2, zMin + depth / 2],
  };
}

export function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}
