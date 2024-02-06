import { GLOBAL_STATE } from "../state";
import { svg, html } from "lit-html";
import { updateFashioning } from "../interaction/chartInteraction";

const POINT_RADIUS = 8;
const POINT_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;

export function pathAnnotations() {
  let pts = GLOBAL_STATE.boundary;
  let scale = GLOBAL_STATE.scale;
  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    let [x1, y1, f] = pts[i];
    let [x2, y2] = pts[(i + 1) % numPts];

    geom.push(html` <div
      class="sloper-container"
      style="transform: translate(${(scale * (x1 + x2)) / 2}px, ${(scale *
        (y1 + y2)) /
      -2}px)">
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
  let pts = GLOBAL_STATE.boundary;
  let scale = GLOBAL_STATE.scale;
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

    // geom.push(svg`
    // <g transform="scale(1 -1) translate(${(x1 + x2) / 2}, ${(y1 + y2) / -2})" >
    //   <foreignobject transform="scale(${1 / scale})" width="50" height="30">
    //   <div class="dragger-container">
    //       <input class="dragger" type="range" style="width: 100%;"/>
    //   </div>
    //   </foreignobject>
    // </g>`);
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
