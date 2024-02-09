import { GLOBAL_STATE as state } from "../state";
import { svg, html } from "lit-html";
import { updateFashioning } from "../interaction/boundaries";

const POINT_RADIUS = 8;
const POINT_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;

export function pathAnnotations() {
  const { boundary: pts, scale, stitchGauge, rowGauge } = state;

  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    let [x1, y1, f] = pts[i];
    let [x2, y2] = pts[(i + 1) % numPts];

    let rise = ((y2 - y1) * rowGauge).toFixed(2);
    let run = ((x2 - x1) * stitchGauge).toFixed(2);

    let length = Math.sqrt(rise * rise + run * run).toFixed(2);

    geom.push(html` <div
      class="path-annotation"
      style="transform: translate(${(scale * (x1 + x2)) / 2}px, ${(scale *
        (y1 + y2)) /
      -2}px)">
      <div class="stitch-slope"><span>${rise}/${run}</span></div>
      <span>${length}"</span>
      <input
        type="number"
        class="fashioning-input"
        .value=${String(f)}
        min="0"
        @click=${(e) => updateFashioning(i, Number(e.target.value))} />
    </div>`);
  }

  return geom;
}

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
