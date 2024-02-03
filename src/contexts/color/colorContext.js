import { dispatch, GLOBAL_STATE } from "../../state";
import { polygonBbox } from "../shape/shapeHelp";
import { html, svg } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";

let activeTool = "hand";
let canvasRef = createRef();
let svgRef = createRef();

export function drawColorChart() {}

function patternDefs() {
  const cellX = GLOBAL_STATE.scale / GLOBAL_STATE.stitchGauge;
  const cellY = GLOBAL_STATE.scale / GLOBAL_STATE.rowGauge;
  const tick = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  return svg`
    <defs>
      <pattern
        id="grid"
        width="${cellX}"
        height="${cellY}"
        patternUnits="userSpaceOnUse">
        <line stroke-width="1px" stroke="black" x1="0" y1="0.5" x2="${cellX}" y2="0.5"></line>
        <line stroke-width="1px" stroke="black" x1="0.5" y1="0" x2="0.5" y2="${cellY}"></line>
      </pattern>
      <pattern
        id="ruler-vertical"
        width="20"
        height="${tick}"
        x="${x - tick}"
        y="${y - tick}"
        patternUnits="userSpaceOnUse">
        <rect width="${tick}" height="${tick}" class="ruler"></rect>
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="${tick}" y2="0"></line>
      </pattern>
      <pattern
        id="ruler-horizontal"
        width="${tick}"
        height="20"
        x="${x - tick}"
        y="${y - tick}"
        patternUnits="userSpaceOnUse">
        <rect width="${tick}" height="${tick}" class="ruler"></rect>
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="0" y2="${tick}"></line>
      </pattern>
    </defs>`;
}

export function colorContextView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapeChart;
  const bbox = polygonBbox(GLOBAL_STATE.shape);

  const width = Math.round((scale * chart.width) / GLOBAL_STATE.stitchGauge);
  const height = Math.round((scale * chart.height) / GLOBAL_STATE.rowGauge);

  const chartX = Math.round(x + bbox.xMin * scale);
  const chartY = Math.round(y + bbox.yMin * scale);

  return html`
    <div
      style="position: absolute; bottom: 0; left: 0;
      transform: translate(${chartX}px, ${-chartY}px);
      outline: 1px solid black;">
      <canvas ${ref(canvasRef)}></canvas>
    </div>
    <svg
      style="position: absolute; top: 0px; left: 0px; overflow: hidden;"
      width="100%"
      height="100%"
      ${ref(svgRef)}
      ${ref(init)}>
      ${patternDefs()}
      <g transform="scale (1, -1)" transform-origin="center">
        <rect
          style="shape-rendering: crispedges;"
          transform="translate(${chartX} ${chartY})"
          width=${width}
          height=${height}
          fill="url(#grid)"></rect>

        <rect width="20" height="100%" fill="url(#ruler-vertical)"></rect>
        <rect width="100%" height="20" fill="url(#ruler-horizontal)"></rect>
      </g>
    </svg>
  `;
}

function init() {}
