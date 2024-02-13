import { GLOBAL_STATE as state } from "../state";
import { svg, html } from "lit-html";
import { updateFashioning } from "../interaction/boundaries";

const POINT_RADIUS = 8;
const POINT_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;

export function shapingPaths() {
  let pts = state.boundary;
  let scale = state.scale;
  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    let [x1, y1, f] = pts[i];
    let [x2, y2] = pts[(i + 1) % numPts];
    geom.push(
      svg`<line
      class="path"
      data-index="${i}"
      data-fashioning="${f}"
      stroke-width=${PATH_STROKE_WIDTH / scale}
      x1=${x1}
      y1=${y1}
      x2=${x2}
      y2=${y2}>`
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
