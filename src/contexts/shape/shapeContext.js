import { html, svg } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";
import { Bimp } from "../../lib/Bimp";
import { GLOBAL_STATE, dispatch } from "../../state";

import { polygonBbox } from "./shapeHelp";
import { pan, zoom, fitDraft } from "./shapeEvents";
import { scanlineFill } from "./scanline";

let activeTool = "hand";
let canvasRef = createRef();
let svgRef = createRef();

const HANDLE_RADIUS = 8;
const HANDLE_STROKE_WIDTH = 2;
const PATH_STROKE_WIDTH = 4;
const colors = ["#555", "#ddd"];

function computeDraftMask(shape) {
  const bbox = polygonBbox(shape);

  let chart = Bimp.empty(
    Math.ceil(GLOBAL_STATE.stitchGauge * bbox.width),
    Math.ceil(GLOBAL_STATE.rowGauge * bbox.height),
    0
  );

  chart = scanlineFill(bbox, shape, chart);

  return chart;
}

function dragHandle(e) {
  const index = e.target.dataset.index;
  let [x, y] = GLOBAL_STATE.shape[index];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let newShape = [...GLOBAL_STATE.shape];
      newShape[index] = [
        x - dx / GLOBAL_STATE.scale,
        y + dy / GLOBAL_STATE.scale,
      ];

      let chart = computeDraftMask(newShape);

      dispatch({ shape: newShape, shapeChart: chart });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

function addHandle(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  const index = Number(e.target.dataset.index);
  const scale = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  let pos = {
    x: (e.clientX - rect.left - x) / scale,
    y: (rect.height - (e.clientY - rect.top) - y) / scale,
  };

  let pt = [
    (e.clientX - rect.left - x) / scale,
    (rect.height - (e.clientY - rect.top) - y) / scale,
  ];

  const newShape = [...GLOBAL_STATE.shape];
  newShape.splice(index + 1, 0, pt);
  dispatch({ shape: newShape });
}

function pointerdown(e) {
  if (e.target.classList.contains("handle")) {
    dragHandle(e);
  } else if (e.target.classList.contains("draft-line")) {
    addHandle(e);
  } else if (activeTool == "hand") {
    pan(e);
  }
}

function pointermove(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  const index = e.target.dataset.index;
  const scale = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  let pos = {
    x: (e.clientX - rect.left - x) / scale,
    y: (rect.height - (e.clientY - rect.top) - y) / scale,
  };
}
export function resizeCanvas(scale) {
  const canvas = canvasRef.value;

  const width = Math.round(
    (scale * GLOBAL_STATE.shapeChart.width) / GLOBAL_STATE.stitchGauge
  );
  const height = Math.round(
    (scale * GLOBAL_STATE.shapeChart.height) / GLOBAL_STATE.rowGauge
  );

  canvas.width = width;
  canvas.height = height;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

export function drawShapeChart(lastDrawn = null) {
  const chart = GLOBAL_STATE.shapeChart;
  const width = chart.width;
  const height = chart.height;

  const cellX = GLOBAL_STATE.scale / GLOBAL_STATE.stitchGauge;
  const cellY = GLOBAL_STATE.scale / GLOBAL_STATE.rowGauge;

  if (!canvasRef.value) {
    console.warn("Shape context canvas is missing!!!!");
    return;
  }

  const ctx = canvasRef.value.getContext("2d");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let paletteIndex = chart.pixel(x, y);
      if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
        ctx.save();
        ctx.translate(x * cellX, (height - y - 1) * cellY);
        ctx.scale(cellX, cellY);
        ctx.fillStyle = colors[paletteIndex];
        ctx.fillRect(0, 0, 1, 1);
        ctx.restore();
      }
    }
  }
}

function shapingToolbar() {
  return html`<div class="tool-picker">
    <button
      class="btn solid ${activeTool == "hand" ? "current" : ""}"
      @click=${() => (activeTool = "hand")}>
      <i class="fa-solid fa-hand"></i>
    </button>
    <button
      class="btn solid ${activeTool == "line" ? "current" : ""}"
      @click=${() => (activeTool = "line")}>
      <i class="fa-solid fa-draw-polygon"></i>
    </button>
    <button
      class="btn solid ${activeTool == "direct" ? "current" : ""}"
      @click=${() => (activeTool = "direct")}>
      <i class="fa-solid fa-arrow-pointer"></i>
    </button>
    <button class="btn icon" @click=${(e) => fitDraft(svgRef.value)}>
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>`;
}

function draftPath() {
  let pts = GLOBAL_STATE.shape;
  let scale = GLOBAL_STATE.scale;
  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    geom.push(
      svg`<line
      class="draft-line"
      data-index="${i}"
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
      class="handle"
      data-index="${i}"
      cx="${pts[i][0]}"
      cy="${pts[i][1]}"
      stroke-width="${HANDLE_STROKE_WIDTH / scale}"
      r="${HANDLE_RADIUS / scale}" />`
    );
  }

  return geom;
}

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

export function shapeContextView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapeChart;
  const bbox = polygonBbox(GLOBAL_STATE.shape);

  const width = Math.round((scale * chart.width) / GLOBAL_STATE.stitchGauge);
  const height = Math.round((scale * chart.height) / GLOBAL_STATE.rowGauge);

  const chartX = Math.round(x + bbox.xMin * scale);
  const chartY = Math.round(y + bbox.yMin * scale);

  return html`
    ${shapingToolbar()}
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
      ${ref(init)}
      @pointerdown=${pointerdown}
      @pointermove=${pointermove}
      @wheel=${zoom}>
      ${patternDefs()}
      <g transform="scale (1, -1)" transform-origin="center">
        <rect
          style="shape-rendering: crispedges;"
          transform="translate(${chartX} ${chartY})"
          width=${width}
          height=${height}
          fill="url(#grid)"></rect>

        <g transform="translate(${x} ${y})">
          <g transform="scale(${scale})">${draftPath()}</g>
        </g>

        <rect width="20" height="100%" fill="url(#ruler-vertical)"></rect>
        <rect width="100%" height="20" fill="url(#ruler-horizontal)"></rect>
      </g>
    </svg>
  `;
}

function init() {
  if (!svgRef.value) return;
  setTimeout(() => fitDraft(svgRef.value));
  dispatch({
    shapeChart: computeDraftMask(GLOBAL_STATE.shape),
  });
}
