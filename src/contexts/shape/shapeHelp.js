export function polygonBbox(shape) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  shape.forEach(([x, y]) => {
    if (x < xMin) xMin = x;
    if (y < yMin) yMin = y;
    if (x > xMax) xMax = x;
    if (y > yMax) yMax = y;
  });

  return {
    width: Math.abs(xMax - xMin),
    height: Math.abs(yMax - yMin),
    xMin,
    yMin,
    xMax,
    yMax,
  };
}

export function mapCoords(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function mapDraftToChart(pt, bbox, chart) {
  return [
    Math.round(mapCoords(pt[0], bbox.xMin, bbox.xMax, 0, chart.width - 1)),
    Math.round(mapCoords(pt[1], bbox.yMin, bbox.yMax, 0, chart.height)),
  ];
}

export function draftCoordsToChartCoords(pt, bbox, chart) {
  return {
    x: Math.round(mapCoords(pt[0], bbox.xMin, bbox.xMax, 0, chart.width - 1)),
    y: Math.round(mapCoords(pt[1], bbox.yMin, bbox.yMax, 0, chart.height - 1)),
  };
}

export function outsideBounds({ x, y }, chart) {
  if (x < 0 || x >= chart.width || y < 0 || y >= chart.width) {
    return true;
  }
  return false;
}

export function findInside(chart) {
  let x = Math.floor(chart.width / 2);
  let y = 0;
  let inside = null;

  while (inside == null && y < chart.height) {
    if (chart.pixel(x, y) === 1) {
      y++;
      continue;
    }

    let seen = 0;
    for (let xx = x; xx < chart.width; xx++) {
      if (chart.pixel(xx, y) === 1) seen++;
    }

    if (seen % 2 != 0) {
      inside = [x, y];
    }
    y++;
  }

  return { x: inside[0], y: inside[1] };
}
