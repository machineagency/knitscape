import { html, svg } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";
import { Bimp } from "../../lib/Bimp";

import { GLOBAL_STATE, dispatch } from "../../state";
import { chartEditingTools } from "../../actions/chartEditingTools";

import { STITCH_ASPECT } from "../../constants";

function pan(e) {
  const startPos = { x: e.clientX, y: e.clientY };
  const startPan = GLOBAL_STATE.chartPan;

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;

      dispatch({
        chartPan: {
          x: Math.floor(startPan.x - dx),
          y: Math.floor(startPan.y - dy),
        },
      });
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

let activeTool = "hand";
let canvasRef = createRef();
// let gridRef = createRef();
let svgRef = createRef();

function updateChartWidth(newWidth) {
  newWidth = newWidth > 500 ? 500 : newWidth;

  dispatch({
    chart: GLOBAL_STATE.chart.resize(newWidth, GLOBAL_STATE.chart.height),
  });

  fitChart();
}

function updateChartHeight(newHeight) {
  newHeight = newHeight > 500 ? 500 : newHeight;
  dispatch({
    chart: GLOBAL_STATE.chart.resize(GLOBAL_STATE.chart.width, newHeight),
  });

  fitChart();
}

function chartCoords(event, target) {
  const bounds = target.getBoundingClientRect();

  const x = Math.floor(
    ((event.clientX - bounds.x) / GLOBAL_STATE.scale) * GLOBAL_STATE.stitchGauge
  );

  const y =
    GLOBAL_STATE.shapeChart.height -
    Math.floor(
      ((event.clientY - bounds.y) / GLOBAL_STATE.scale) * GLOBAL_STATE.rowGauge
    ) -
    1;

  return { x, y };
}

function outsideBounds({ x, y }) {
  if (
    x < 0 ||
    x >= GLOBAL_STATE.shapeChart.width ||
    y < 0 ||
    y >= GLOBAL_STATE.shapeChart.width
  ) {
    return true;
  }
  return false;
}

function editChart(canvas, tool) {
  // tool onMove is not called unless pointer moves into another cell in the chart
  let pos = GLOBAL_STATE.pos;
  dispatch({ transforming: true });

  let onMove = tool(pos);
  if (!onMove) return;

  function move(moveEvent) {
    if (moveEvent.buttons == 0) {
      end();
    } else {
      let newPos = GLOBAL_STATE.pos;

      if (newPos.x == pos.x && newPos.y == pos.y) return;
      onMove(newPos);
      pos = newPos;
    }
  }

  function end() {
    dispatch({ transforming: false });

    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", end);
    canvas.removeEventListener("pointerleave", end);
  }

  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointerleave", end);
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

      dispatch({ shape: newShape });
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

function pointerdown(e) {
  const coords = chartCoords(e, canvasRef.value);

  if (e.target.classList.contains("handle")) {
    dragHandle(e);
  } else if (outsideBounds(coords) || activeTool == "hand") {
    pan(e);
  }
}

function pointermove(e) {
  const { x, y } = chartCoords(e, canvasRef.value);

  if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
    dispatch({ pos: { x, y } });
  }
}

function pointerleave() {
  dispatch({ pos: { x: -1, y: -1 } });
}

const colors = ["#000", "#ddd"];

function drawShapeChart(lastDrawn = null) {
  const chart = GLOBAL_STATE.shapeChart;
  const width = chart.width;
  const height = chart.height;

  const cellX = GLOBAL_STATE.scale / GLOBAL_STATE.stitchGauge;
  const cellY = GLOBAL_STATE.scale / GLOBAL_STATE.rowGauge;

  const ctx = canvasRef.value.getContext("2d");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.save();
      ctx.translate(x * cellX, (height - y - 1) * cellY);
      ctx.scale(cellX, cellY);
      ctx.fillStyle = colors[chart.pixel(x, y)];
      ctx.fillRect(0, 0, 1, 1);
      ctx.restore();
    }
  }
}

export function shapeMonitor(canvases) {
  return ({ state }) => {
    let { scale, shapeChart } = state;

    let width = shapeChart.width;
    let height = shapeChart.height;
    let lastDrawn = shapeChart;

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.shapeChart.width ||
          height != state.shapeChart.height
        ) {
          width = state.shapeChart.width;
          height = state.shapeChart.height;
          scale = state.scale;

          lastDrawn = null;
        }

        if (lastDrawn != state.shapeChart) {
          drawShapeChart(lastDrawn);
          lastDrawn = state.shapeChart;
        }
      },
    };
  };
}

export function redrawShapeContext() {
  drawShapeChart(null);
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
    <button class="btn icon" @click=${fitShape}>
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>`;
}

function drawShape() {
  let pts = GLOBAL_STATE.shape;
  let scale = GLOBAL_STATE.scale;
  let numPts = pts.length;
  let geom = [];

  for (let i = 0; i < numPts; i++) {
    geom.push(
      svg`<line class="shape-line"
      stroke-width=${4 / scale}
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
      stroke-width="${2 / scale}"
      r="${8 / scale}" />`
    );
  }

  return geom;
}

function calcBbox() {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  GLOBAL_STATE.shape.forEach(([x, y]) => {
    if (x < xMin) xMin = x;
    if (y < yMin) yMin = y;
    if (x > xMax) xMax = x;
    if (y > yMax) yMax = y;
  });

  return {
    width: Math.abs(xMax - xMin),
    height: Math.abs(yMax - yMin),
    xMin,
    yMin,
    xMax,
    yMax,
  };
}

function makeChartToShape() {
  const bbox = calcBbox();

  dispatch({
    shapeChart: Bimp.empty(
      Math.ceil(GLOBAL_STATE.stitchGauge * bbox.width),
      Math.ceil(GLOBAL_STATE.rowGauge * bbox.height),
      1
    ),
  });
}

function fitShape() {
  const bbox = calcBbox();
  const { width, height } = svgRef.value.getBoundingClientRect();
  const scale = Math.floor(
    0.9 *
      Math.min(Math.floor(width / bbox.width), Math.floor(height / bbox.height))
  );

  dispatch({
    scale,
    chartPan: {
      x: (width - scale * bbox.width) / 2,
      y: (height - scale * bbox.height) / 2,
    },
  });
}

function init() {
  setTimeout(fitShape);
  makeChartToShape();
}

function gridPattern() {
  const cellX = GLOBAL_STATE.scale / GLOBAL_STATE.stitchGauge;
  const cellY = GLOBAL_STATE.scale / GLOBAL_STATE.rowGauge;
  const chart = GLOBAL_STATE.shapeChart;

  return svg`
    <defs>
      <pattern
        id="grid"
        width="${cellX}"
        height="${cellY}"
        patternUnits="userSpaceOnUse">
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="${cellX}" y2="0"></line>
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="0" y2="${cellY}"></line>
      </pattern>
    </defs>
    <rect
      class="grid-background"
      width=${cellX * chart.width}
      height=${cellY * chart.height}
      fill="url(#grid)">
    </rect>`;
}

export function shapeContextView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapeChart;

  const width = (scale * chart.width) / GLOBAL_STATE.stitchGauge;
  const height = (scale * chart.height) / GLOBAL_STATE.rowGauge;

  return html`
    ${shapingToolbar()}
    <div
      style="position: absolute; transform: translate(${x}px, ${y}px);
      outline: 1px solid black;">
      <canvas
        width="${width}"
        height="${height}"
        style="width: ${width}px; height: ${height}px"
        ${ref(canvasRef)}
        ${ref(drawShapeChart)}>
      </canvas>
    </div>
    <svg
      style="position: absolute; top: 0px; left: 0px; overflow: hidden;"
      width="100%"
      height="100%"
      ${ref(svgRef)}
      ${ref(init)}
      @pointerdown=${pointerdown}
      @pointermove=${pointermove}
      @pointerleave=${pointerleave}>
      <g transform="scale (1, -1)" transform-origin="center">
        <g transform="translate(${x} ${y})">
          ${gridPattern()}
          <g transform="scale(${scale})">${drawShape()}</g>
        </g>
      </g>
    </svg>
  `;
}
