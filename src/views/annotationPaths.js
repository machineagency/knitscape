import { GLOBAL_STATE } from "../state";
import { svg } from "lit-html";
const POINT_RADIUS = 8;
const POINT_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;

export function annotationPaths() {
  let { paths, scale } = GLOBAL_STATE;
  let geom = [];

  for (let p = 0; p < paths.length; p++) {
    const numPts = paths[p].length;
    for (let i = 0; i < numPts; i++) {
      let [x1, y1, f] = paths[p][i];
      let [x2, y2] = paths[p][(i + 1) % numPts];
      geom.push(
        svg`<line
      class="path annotation"
      data-index="${i}"
      data-fashioning="${f}"
      stroke-width=${PATH_STROKE_WIDTH / scale}
      x1=${x1}
      y1=${y1}
      x2=${x2}
      y2=${y2}>`
      );
    }
  }

  for (let p = 0; p < paths.length; p++) {
    const numPts = paths[p].length;
    for (let i = 0; i < numPts; i++) {
      geom.push(
        svg`<circle
      class="point annotation"
      data-index="${i}"
      cx="${paths[p][i][0]}"
      cy="${paths[p][i][1]}"
      stroke-width="${POINT_STROKE_WIDTH / scale}"
      r="${POINT_RADIUS / scale}" />`
      );
    }
  }

  return geom;
}
