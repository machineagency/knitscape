export function processContextView() {
  const { x, y } = GLOBAL_STATE.chartPan;
  const scale = GLOBAL_STATE.scale;
  const chart = GLOBAL_STATE.shapeChart;
  return html`
    <div
      class="canvas-transform-group"
      style="transform: translate(${Math.floor(x)}px, ${Math.floor(y)}px);">
      <canvas
        width="${scale * chart.width}"
        height="${scale * chart.height}"
        style="${(scale * chart.width) / devicePixelRatio}px; height: ${(scale *
          chart.height) /
        devicePixelRatio}px"
        @pointerdown=${pointerdown}
        @pointermove=${pointermove}
        @pointerleave=${pointerleave}
        ${ref(canvasRef)}
        ${ref(drawShapeChart)}>
      </canvas>
    </div>
  `;
}
