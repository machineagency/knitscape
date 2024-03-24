import { stitches } from "../constants";

function addEdge(edgeTable, [x1, y1], [x2, y2]) {
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  if (y1 === y2) return; // Skip horizontal edges

  let slope = (x2 - x1) / (y2 - y1);

  edgeTable.push({
    x: x1,
    yMin: y1,
    yMax: y2,
    slope,
  });
}

export function knitScanline(
  stitchChart,
  yarnChart,
  points,
  { stitchBlock, yarnBlock, pos }
) {
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
      if (edges[0].yMin <= y) {
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

      let stitchChanges = [];
      let yOffset = (y - pos[1]) % stitchBlock.height;
      if (yOffset < 0) yOffset = stitchBlock.height + yOffset;

      for (let x = xStart; x < xEnd; x++) {
        let xOffset = (x - pos[0]) % stitchBlock.width;

        if (xOffset < 0) xOffset = stitchBlock.width + xOffset;
        if (xOffset >= stitchBlock.width || yOffset >= stitchBlock.height)
          continue;

        let operation = stitchBlock.pixel(xOffset, yOffset);
        if (operation == stitches.TRANSPARENT) continue;
        stitchChanges.push({ x, y, color: operation });
      }
      stitchChart = stitchChart.draw(stitchChanges);

      // Apply the yarn block texture
      let yarnChanges = [];
      let yOffsetYarn = (y - pos[1]) % yarnBlock.height;
      if (yOffsetYarn < 0) yOffsetYarn = yarnBlock.height + yOffsetYarn;

      for (let x = xStart; x < xEnd; x++) {
        let xOffset = (x - pos[0]) % yarnBlock.width;

        if (xOffset < 0) xOffset = yarnBlock.width + xOffset;
        if (xOffset >= yarnBlock.width || yOffsetYarn >= yarnBlock.height)
          yarnChanges.push({ x, y, color: 1 });

        let yarnColor = yarnBlock.pixel(xOffset, yOffsetYarn);
        if (yarnColor == 0) {
          // if there's no assigned yarn check what's below it in the chart
          if (yarnChart.pixel(x, y) == 0) {
            // if it's also transparent, assign yarn index 1 to make sure we have a yarn
            yarnChanges.push({ x, y, color: 1 });
          }
          continue;
        }
        yarnChanges.push({ x, y, color: yarnColor });
      }
      yarnChart = yarnChart.draw(yarnChanges);
    }

    y++;

    // filter out any edges we've passed
    activeEdges = activeEdges.filter((edge) => edge.yMax > y);

    // update the x value for each edge
    for (let i = 0; i < activeEdges.length; i++) {
      activeEdges[i].x += activeEdges[i].slope;
    }
  }

  return { stitch: stitchChart, yarn: yarnChart };
}
