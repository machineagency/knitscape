import { svg } from "lit-html";

export const gridPattern = (cellWidth, cellHeight) => svg`
      <pattern
        id="grid"
        width="${cellWidth}"
        height="${cellHeight}"
        patternUnits="userSpaceOnUse">
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="${cellWidth}" y2="0"></line>
        <line stroke-width="1px" stroke="black" x1="0" y1="0" x2="0" y2="${cellHeight}"></line>
      </pattern>`;

export const cellShadow = () => svg`
<filter id="path-shadow">
  <feOffset in="SourceAlpha" dx="0" dy="0" />
  <feGaussianBlur stdDeviation="3" />
  <feBlend in="SourceGraphic" in2="blurOut" />
</filter>`;
