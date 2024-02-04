// import { html } from "lit-html";
// import { GLOBAL_STATE, dispatch } from "../state";
// import { MIN_SCALE, MAX_SCALE } from "../constants";
// import { centerZoom, fitChart } from "../actions/zoomFit";

// export function chartTools() {
//   return html` <div class="panzoom-controls">
//     <span>[${GLOBAL_STATE.pos.x}, ${GLOBAL_STATE.pos.y}]</span>
//     <i class="fa-solid fa-palette"></i>

//     <input
//       type="checkbox"
//       checked
//       @change=${(e) =>
//         dispatch({
//           colorMode: e.target.checked ? "operation" : "yarn",
//         })} />
//     <button class="btn icon" @click=${() => centerZoom(GLOBAL_STATE.scale - 1)}>
//       <i class="fa-solid fa-magnifying-glass-minus"></i>
//     </button>
//     <input
//       type="range"
//       min=${MIN_SCALE}
//       max=${MAX_SCALE}
//       .value=${String(GLOBAL_STATE.scale)}
//       @input=${(e) => centerZoom(Number(e.target.value))} />
//     <button class="btn icon" @click=${() => centerZoom(GLOBAL_STATE.scale + 1)}>
//       <i class="fa-solid fa-magnifying-glass-plus"></i>
//     </button>
//     <button class="btn icon" @click=${fitChart}>
//       <i class="fa-solid fa-expand"></i>
//     </button>
//   </div>`;
// }
