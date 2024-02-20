import { stitches } from "../constants";
import { Bimp } from "../lib/Bimp";

export function polygonBbox(boundary) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  boundary.forEach(([x, y]) => {
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

export function bBoxAllBoundaries(boundaries) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  for (const boundary of boundaries) {
    boundary.forEach(([x, y]) => {
      if (x < xMin) xMin = x;
      if (y < yMin) yMin = y;
      if (x > xMax) xMax = x;
      if (y > yMax) yMax = y;
    });
  }

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

export function toChartCoords(pt, bbox, chart) {
  return [
    Math.round(mapCoords(pt[0], bbox.xMin, bbox.xMax, 0, chart.width)),
    Math.round(mapCoords(pt[1], bbox.yMin, bbox.yMax, 0, chart.height)),
  ];
}

function addEdge(edgeTable, [x1, y1], [x2, y2], f) {
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  if (y1 === y2) return; // Skip horizontal edges
  edgeTable.push({
    x: x1,
    y: y1,
    yMax: y2,
    slope: (x2 - x1) / (y2 - y1),
    xLast: x1,
    f,
  });
}

export function scanlineFill(
  boundary,
  stitchGauge,
  rowGauge,
  fillOp = stitches.KNIT
) {
  const bbox = polygonBbox(boundary);

  let chart = Bimp.empty(
    Math.ceil(stitchGauge * bbox.width),
    Math.ceil(rowGauge * bbox.height),
    0
  ); // Make a chart that contains the boundary

  const points = boundary.map((pt) => toChartCoords(pt, bbox, chart));
  let edges = [];

  for (let i = 0; i < points.length; i++) {
    addEdge(edges, points[i], points[(i + 1) % points.length], boundary[i][2]);
  }

  edges.sort((a, b) => a.y - b.y); // sort edges by their min y

  let activeEdges = [];
  let y = 0;

  // If there are still edges left to process
  while (edges.length > 0 || activeEdges.length > 0) {
    while (edges.length > 0) {
      // while there are still inactive edges
      if (edges[0].y == y) {
        // add any edges that start on this row
        activeEdges.push(edges.shift());
      } else break;
    }

    activeEdges.sort((a, b) => a.x - b.x); // sort active edges by x

    for (let i = 0; i < activeEdges.length; i = i + 2) {
      // fill in between ascending pairs
      chart = chart.line(
        { x: Math.round(activeEdges[i].x), y },
        { x: Math.round(activeEdges[i + 1].x) - 1, y }, // Fill up to but not including x
        fillOp
      );
    }

    y++;

    // filter out any edges we've passed
    activeEdges = activeEdges.filter((edge) => edge.yMax > y);

    // update the x value for each edge
    for (let i = 0; i < activeEdges.length; i++) {
      activeEdges[i].x += activeEdges[i].slope;
    }
  }

  return chart;
}
