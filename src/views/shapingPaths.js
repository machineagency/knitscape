import { GLOBAL_STATE } from "../state";
import { svg } from "lit-html";

const POINT_RADIUS = 8;
const POINT_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;

export function shapingPaths() {
  let pts = GLOBAL_STATE.boundary;
  let scale = GLOBAL_STATE.scale;
  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    geom.push(
      svg`<line
      class="path"
      data-index="${i}"
      data-fashioning="${pts[i][2]}"
      stroke-width=${PATH_STROKE_WIDTH / scale}
      x1=${pts[i][0]}
      y1=${pts[i][1]}
      x2=${pts[(i + 1) % numPts][0]}
      y2=${pts[(i + 1) % numPts][1]}>`
    );
  }

  for (let i = 0; i < numPts; i++) {
    geom.push(
      svg`<circle
      class="point"
      data-index="${i}"
      cx="${pts[i][0]}"
      cy="${pts[i][1]}"
      stroke-width="${POINT_STROKE_WIDTH / scale}"
      r="${POINT_RADIUS / scale}" />`
    );
  }

  return geom;
}
