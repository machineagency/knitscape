import { toChartCoords } from "./helpers";

function addEdge(edgeTable, [x1, y1], [x2, y2]) {
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  if (y1 === y2) return; // Skip horizontal edges
  edgeTable.push({ x: x1, y: y1, yMax: y2, slope: (x2 - x1) / (y2 - y1) });
}

export function scanlineFill(bbox, shape, chart) {
  const points = shape.map((pt) => toChartCoords(pt, bbox, chart));

  let edges = [];

  for (let i = 0; i < points.length; i++) {
    addEdge(edges, points[i], points[(i + 1) % points.length]);
  }

  edges.sort((a, b) => a.y - b.y); // sort edges by their min y

  let activeEdges = [];
  let y = 0;

  while (edges.length > 0 || activeEdges.length > 0) {
    while (edges.length > 0) {
      if (edges[0].y == y) {
        // add edges that start on this row
        activeEdges.push(edges.shift());
      } else {
        break;
      }
    }

    activeEdges.sort((a, b) => a.x - b.x); // sort edges by x

    for (let i = 0; i < activeEdges.length; i = i + 2) {
      // fill in between ascending pairs
      chart = chart.line(
        { x: Math.round(activeEdges[i].x), y },
        { x: Math.round(activeEdges[i + 1].x), y },
        1
      );
    }

    y++;

    activeEdges = activeEdges.filter((edge) => edge.yMax > y); // filter out any edges we've passed

    for (let i = 0; i < activeEdges.length; i++) {
      activeEdges[i].x += activeEdges[i].slope; // update the x value for each edge
    }
  }

  return chart;
}
