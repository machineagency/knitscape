import { svg } from "lit-html";

export const gridPattern = (cellWidth, cellHeight) => svg`
<pattern
  id="grid"
  width="${cellWidth}"
  height="${cellHeight}"
  patternUnits="userSpaceOnUse">
  <line stroke="black" x1="0" y1="0" x2="${cellWidth}" y2="0"></line>
  <line stroke="black" x1="0" y1="0" x2="0" y2="${cellHeight}"></line>
</pattern>`;

export const cellShadow = () => svg`
<filter id="path-shadow">
  <feOffset in="SourceAlpha" dx="0" dy="0" />
  <feGaussianBlur stdDeviation="3" />
  <feBlend in="SourceGraphic" in2="blurOut" />
</filter>`;

export const activeBoundaryMask = (
  boundary,
  chartPan,
  cellWidth,
  cellHeight
) => {
  if (!boundary) return;
  return svg`
<mask id="boundarymask">
  <rect x="0" y="0" width="100%" height="100%" fill="#969696ff" />
  <g transform="scale (1, -1)" transform-origin="center">
    <g transform="translate(${chartPan.x} ${chartPan.y})">
      <path d="M ${boundary.reduce(
        (acc, [x, y]) => `${acc} ${x * cellWidth} ${y * cellHeight}`,
        ""
      )} Z"
          fill="black" />
    </g>
  </g>
</mask>

<filter id="grayscale">
  <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/>
</filter>
<rect fill="gray" width="100%" height="100%" filter="url(#grayscale)" mask="url(#boundarymask)"/>
 `;
};
