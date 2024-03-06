import { stitches } from "../constants";

function mapCoords(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function toChartCoords(pt, bbox, chart) {
  return [
    mapCoords(pt[0], bbox.xMin, bbox.xMax, 0, chart.width),
    mapCoords(pt[1], bbox.yMin, bbox.yMax, 0, chart.height),
  ];
}

function addEdge(edgeTable, [x1, y1], [x2, y2]) {
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  if (y1 === y2) return; // Skip horizontal edges

  let slope = (x2 - x1) / (y2 - y1);

  edgeTable.push({
    x: x1 + slope / 2,
    yMin: y1,
    yMax: y2,
    slope,
  });
}

export function knitScanline(
  stitchChart,
  yarnChart,
  bbox,
  boundary,
  stitchBlock,
  fillData,
  yarnBlock
) {
  if (fillData.fillType == "stitch") {
    if (fillData.stitch == 0) return { stitch: stitchChart, yarn: yarnChart };
  } else if (fillData.fillType == "block") {
    if (stitchBlock == undefined)
      return { stitch: stitchChart, yarn: yarnChart };
  }

  const points = boundary.map((pt) => toChartCoords(pt, bbox, stitchChart));

  let edges = [];

  for (let i = 0; i < points.length; i++) {
    addEdge(edges, points[i], points[(i + 1) % points.length]);
  }
  edges.sort((a, b) => a.yMin - b.yMin); // sort edges by their min y

  let activeEdges = [];
  let y = 0;

  // If there are still edges left to process
  while (edges.length > 0 || activeEdges.length > 0) {
    while (edges.length > 0) {
      // while there are still edges we haven't processed
      if (edges[0].yMin <= y + 0.5) {
        // add any edges that start at or below the current Y value
        activeEdges.push(edges.shift());
      } else break;
    }

    activeEdges.sort((a, b) => a.x - b.x); // sort active edges by x

    for (let i = 0; i < activeEdges.length; i = i + 2) {
      if (i + 1 >= activeEdges.length) {
        console.error("index out of range");
        continue;
      }

      const xStart = Math.round(activeEdges[i].x);
      const xEnd = Math.round(activeEdges[i + 1].x);

      if (xStart == xEnd) continue;

      if (fillData.fillType == "stitch") {
        // fill in between ascending pairs
        stitchChart = stitchChart.line(
          { x: xStart, y },
          { x: xEnd - 1, y }, // Fill up to but not including x
          fillData.stitch
        );
      } else if (fillData.fillType == "block") {
        // let block = blocks[fillData.blockID];
        let { bitmap, pos } = stitchBlock;
        let changes = [];
        let yOffset = (y - pos[1]) % (bitmap.height + fillData.gap[1]);
        if (yOffset < 0) yOffset = bitmap.height + fillData.gap[1] + yOffset;

        for (let x = xStart; x < xEnd; x++) {
          let xOffset = (x - pos[0]) % (bitmap.width + fillData.gap[0]);

          if (xOffset < 0) xOffset = bitmap.width + fillData.gap[0] + xOffset;
          if (xOffset >= bitmap.width || yOffset >= bitmap.height) continue;

          let operation = bitmap.pixel(xOffset, yOffset);
          if (operation == stitches.TRANSPARENT) continue;
          changes.push({ x, y, color: operation });
        }
        stitchChart = stitchChart.draw(changes);
      }

      let { bitmap, pos } = yarnBlock;
      let changes = [];
      let yOffset = (y - pos[1]) % bitmap.height;

      for (let x = xStart; x < xEnd; x++) {
        let xOffset = (x - pos[0]) % bitmap.width;

        if (xOffset < 0) xOffset = bitmap.width + xOffset;
        if (xOffset >= bitmap.width || yOffset >= bitmap.height) continue;

        let yarnColor = bitmap.pixel(xOffset, yOffset) + 1;
        changes.push({ x, y, color: yarnColor });
      }
      yarnChart = yarnChart.draw(changes);
    }

    y++;

    // filter out any edges we've passed
    activeEdges = activeEdges.filter((edge) => edge.yMax > y + 0.5);

    // update the x value for each edge
    for (let i = 0; i < activeEdges.length; i++) {
      activeEdges[i].x += activeEdges[i].slope;
    }
  }

  return { stitch: stitchChart, yarn: yarnChart };
}
