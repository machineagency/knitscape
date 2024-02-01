import { html } from "lit-html";
import { ref, createRef } from "lit-html/directives/ref.js";

import { GLOBAL_STATE, dispatch } from "../../state";
import { chartEditingTools } from "../../actions/chartEditingTools";

const dpr = devicePixelRatio;
let activeTool = "line";
let canvasRef = createRef();
let gridRef = createRef();

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
    ((event.clientX - bounds.x) / GLOBAL_STATE.scale) * devicePixelRatio
  );
  const y =
    GLOBAL_STATE.chart.height -
    Math.floor(
      ((event.clientY - bounds.y) / GLOBAL_STATE.scale) * devicePixelRatio
    ) -
    1;

  return { x, y };
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

function pointerdown(e) {
  const activeTool = GLOBAL_STATE.activeTool;

  if (activeTool in chartEditingTools) {
    editChart(e.target, chartEditingTools[activeTool]);
  } else {
    console.warn(`Uh oh, ${activeTool} is not a tool`);
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

function drawShapeChart() {
  const chart = GLOBAL_STATE.shapeChart;
  const width = chart.width;
  const height = chart.height;
  const scale = GLOBAL_STATE.scale;
  const ctx = canvasRef.value.getContext("2d");
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.save();
      ctx.translate(x * scale, (height - y - 1) * scale);
      ctx.scale(scale, scale);
      ctx.fillStyle = colors[chart.pixel(x, y)];
      ctx.fillRect(0, 0, 1, 1);
      ctx.restore();
    }
  }
}

function drawGrid() {
  const chart = GLOBAL_STATE.shapeChart;
  const width = chart.width;
  const height = chart.height;
  const scale = GLOBAL_STATE.scale;
  const ctx = gridRef.value.getContext("2d");

  ctx.resetTransform();
  ctx.clearRect(0, 0, gridRef.value.width, gridRef.value.height);
  ctx.translate(-0.5, -0.5);
  ctx.beginPath();

  for (let x = 0; x < width; x++) {
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, height * scale + 1);
  }

  for (let y = 0; y < height; y++) {
    ctx.moveTo(0, y * scale);
    ctx.lineTo(width * scale + 1, y * scale);
  }

  ctx.stroke();
}

export function redrawShapeContext() {
  drawShapeChart();
  drawGrid();
}

function shapingToolbar() {
  return html`<div class="tool-picker">
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
  </div>`;
}

export function shapeContextView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapeChart;
  const width = scale * chart.width;
  const height = scale * chart.height;

  return html`
    ${shapingToolbar()}
    <div
      style="position: absolute; transform: translate(${Math.floor(
        x
      )}px, ${Math.floor(y)}px);
      outline: 1px solid black;"
      @pointerdown=${pointerdown}
      @pointermove=${pointermove}
      @pointerleave=${pointerleave}>
      <canvas
        width="${width}"
        height="${height}"
        style="width: ${width / dpr}px; height: ${height / dpr}px"
        ${ref(canvasRef)}
        ${ref(drawShapeChart)}>
      </canvas>
      <canvas
        width="${width}"
        height="${height}"
        style="width: ${width / dpr}px; height: ${height /
        dpr}px; position: absolute; top: 0;"
        ${ref(gridRef)}
        ${ref(drawGrid)}>
      </canvas>
      <svg
        width="${width / dpr}"
        height="${height / dpr}"
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="xMidyMid slice"
        style="position: absolute; top: 0;">
        <circle
          class="edge-grabber"
          cx="${(GLOBAL_STATE.pos.x + 1) * scale - scale / 2}"
          cy="0"
          r="15" />
        <circle
          class="edge-grabber"
          cx="${(GLOBAL_STATE.pos.x + 1) * scale - scale / 2}"
          cy="${height}"
          r="15" />
        <circle
          class="edge-grabber"
          cx="${width}"
          cy="${height - GLOBAL_STATE.pos.y * scale - scale / 2}"
          r="15" />
        <circle
          class="edge-grabber"
          cx="0"
          cy="${height - GLOBAL_STATE.pos.y * scale - scale / 2}"
          r="15" />
      </svg>
    </div>
  `;
}
