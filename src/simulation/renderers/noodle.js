import {
  Renderer,
  Transform,
  Program,
  Camera,
  Orbit,
  Vec3,
  Geometry,
  Mesh,
} from "ogl";

import { buildYarnCurve } from "./utils/yarnSpline";

let gl, controls, renderer, camera, scene;
let yarnPoints = [];
let yarnGeometry = [];
let yarnColors = [];

const vertexShader = /* glsl */ `
precision highp float;
// position in the instance geometry
attribute vec2 position;

// two endpoints of a yarn segment
attribute vec3 pointA;
attribute vec3 pointB;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 resolution;

uniform float uWidth;

varying float across;

void main() {
  // The segment endpoint positions in model view space
  vec4 p0 = modelViewMatrix * vec4(pointA, 1.0);
  vec4 p1 = modelViewMatrix * vec4(pointB, 1.0);

  // This is our position in the instance geometry. the x component is along the line segment
  vec2 tangent = p1.xy - p0.xy;
  vec2 normal =   normalize(vec2(-tangent.y, tangent.x)); // perp

  vec4 currentPoint = mix(p0, p1, position.x);
  vec2 pt = currentPoint.xy + uWidth *(position.x * tangent +  position.y * normal);

  gl_Position = projectionMatrix * vec4(pt, currentPoint.z, 1.0);

  across = position.y;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColor;
varying float across;

void main() {
    vec3 normal = vec3(0, 0, -1);
    vec3 highlight = normalize(vec3(0.0, across, -0.1 ));
    float light = dot(normal, highlight);

    light = smoothstep(0.0, 0.5, light);

    gl_FragColor.rgb = uColor * light;
    gl_FragColor.a = 1.0;
}
`;

const joinVertexShader = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 pointA;
attribute vec3 pointB;
attribute vec3 pointC;

uniform float uWidth;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying float across;

void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;

  vec4 clipA = modelViewMatrix * vec4(pointA, 1.0);
  vec4 clipB = modelViewMatrix * vec4(pointB, 1.0);
  vec4 clipC = modelViewMatrix * vec4(pointC, 1.0);

  // Calculate the normal to the join tangent
  vec2 tangent = normalize(normalize(clipC.xy - clipB.xy) + normalize(clipB.xy - clipA.xy));
  vec2 normal = vec2(-tangent.y, tangent.x);

  vec2 ab = clipB.xy - clipA.xy;
  vec2 cb = clipB.xy - clipC.xy;

  vec2 abn = normalize(vec2(-ab.y, ab.x));
  vec2 cbn = -normalize(vec2(-cb.y, cb.x));

  float sigma = sign(dot(ab + cb, normal)); // Direction of the bend

  // Basis vectors for the bevel geometry
  vec2 p0 = 0.5 * sigma * uWidth * (sigma < 0.0 ? abn : cbn);
  vec2 p1 = 0.5 * sigma * uWidth * (sigma < 0.0 ? cbn : abn);


  // Final vertex position coefficients ([0,0], [0,1], [1,0])
  vec2 clip = clipB.xy + position.x * p0 + position.y * p1;

  gl_Position = projectionMatrix * vec4(clip, clipB.z, clipB.w);

  across = (position.x + position.y) * 0.5 * sigma;
}
`;

function buildYarnSegmentGeometry(splinePts, pointBuffer) {
  const instanceCount = splinePts.length / 3 - 1;

  const instanceGeometry = [
    [0, -0.5],
    [1, -0.5],
    [0, 0.5],
    [1, 0.5],
  ];

  const geometry = new Geometry(gl, {
    position: {
      size: 2,
      data: new Float32Array(instanceGeometry.flat()),
      instanced: 0,
    },
    pointA: {
      data: splinePts,
      buffer: pointBuffer,
      instanced: 1,
      count: instanceCount,
      size: 3,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
    },
    pointB: {
      data: splinePts,
      buffer: pointBuffer,
      instanced: 1,
      count: instanceCount,
      size: 3,
      offset: Float32Array.BYTES_PER_ELEMENT * 3,
    },
  });

  geometry.setDrawRange(0, instanceGeometry.length);
  geometry.setInstancedCount(instanceCount);

  return geometry;
}

function buildJoinGeometry(splinePts, pointBuffer) {
  const instanceCount = splinePts.length / 3 - 2;

  const instanceGeometry = [
    [0, 0],
    [1, 0],
    [0, 1],
  ];

  const geometry = new Geometry(gl, {
    position: {
      size: 2,
      data: new Float32Array(instanceGeometry.flat()),
      instanced: 0,
    },
    pointA: {
      data: splinePts,
      buffer: pointBuffer,
      instanced: 1,
      count: instanceCount,
      size: 3,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
    },
    pointB: {
      data: splinePts,
      buffer: pointBuffer,
      instanced: 1,
      count: instanceCount,
      size: 3,
      offset: Float32Array.BYTES_PER_ELEMENT * 3,
    },
    pointC: {
      data: splinePts,
      buffer: pointBuffer,
      instanced: 1,
      count: instanceCount,
      size: 3,
      offset: Float32Array.BYTES_PER_ELEMENT * 6,
    },
  });

  geometry.setDrawRange(0, instanceGeometry.length);
  geometry.setInstancedCount(instanceCount);

  return geometry;
}

function minMax(pts) {
  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };

  for (let i = 0; i + 2 < pts.length; i += 3) {
    min.x = Math.min(min.x, pts[i + 0]);
    min.y = Math.min(min.y, pts[i + 1]);
    min.z = Math.min(min.z, pts[i + 2]);
    max.x = Math.max(max.x, pts[i + 0]);
    max.y = Math.max(max.y, pts[i + 1]);
    max.z = Math.max(max.z, pts[i + 2]);
  }

  return { min, max };
}

function computeCenter(pts) {
  const { min, max } = minMax(pts);

  return [0.5 * (min.x + max.x), 0.5 * (min.y + max.y), 0.5 * (min.z + max.z)];
}

function init(yarnData, canvas) {
  renderer = new Renderer({
    dpr: 2,
    canvas: canvas,
    width: canvas.parentNode.clientWidth,
    height: canvas.parentNode.clientHeight,
  });
  gl = renderer.gl;
  gl.clearColor(0.1, 0.1, 0.1, 1);
  gl.enable(gl.POLYGON_OFFSET_FILL);

  let center = computeCenter(yarnData[0].pts);

  if (!camera) {
    camera = new Camera(gl, { fov: 60, far: 100, near: 0.1 });
    camera.position.set(center[0], center[1], 15);

    controls = new Orbit(camera, {
      target: new Vec3(center[0], center[1], 0),
      element: canvas,
    });
    camera.lookAt(controls.target);
  }

  scene = new Transform();

  yarnPoints = [];
  yarnGeometry = [];

  yarnData.forEach((yarn) => {
    if (yarn.pts.length < 6) return;

    const splinePts = new Float32Array(buildYarnCurve(yarn.pts, 12));

    yarnPoints.push(splinePts);

    const pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, splinePts, gl.STATIC_DRAW);

    const geometry = buildYarnSegmentGeometry(splinePts, pointBuffer);
    const joinGeometry = buildJoinGeometry(splinePts, pointBuffer);

    yarnGeometry.push(geometry);
    yarnColors.push(yarn.color);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      cullFace: false,
      uniforms: {
        uWidth: { value: yarn.radius },
        uColor: { value: yarn.color },
      },
    });

    const mesh = new Mesh(gl, {
      mode: gl.TRIANGLE_STRIP,
      geometry,
      program,
    });

    const joinProgram = new Program(gl, {
      vertex: joinVertexShader,
      fragment: fragmentShader,
      cullFace: false,

      uniforms: {
        uColor: { value: yarn.color },
        uWidth: { value: yarn.radius },
      },
    });

    const joinMesh = new Mesh(gl, {
      geometry: joinGeometry,
      program: joinProgram,
    });

    mesh.setParent(scene);
    joinMesh.setParent(scene);

    // Set polygon offset to prevent z fighting
    mesh.onBeforeRender(() => gl.polygonOffset(1, 0));
    joinMesh.onBeforeRender(() => gl.polygonOffset(1, 0));
  });
}

function updateYarnGeometry(yarnData) {
  yarnData.forEach((yarn, yarnIndex) => {
    const splinePts = buildYarnCurve(yarn.pts, 12);

    // Update the points in the yarn's point array
    splinePts.forEach((p, i) => (yarnPoints[yarnIndex][i] = p));

    // Flag for update
    yarnGeometry[yarnIndex].attributes.pointA.needsUpdate = true;
    yarnGeometry[yarnIndex].attributes.pointB.needsUpdate = true;
  });
}

function draw() {
  renderer.setSize(
    gl.canvas.parentNode.clientWidth,
    gl.canvas.parentNode.clientHeight
  );
  camera.perspective({
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
  });
  controls.update();

  renderer.render({ scene, camera });
}

export const noodleRenderer = {
  draw,
  init,
  updateYarnGeometry,
};

// function monitorView() {
//   return html`<div
//     style="position: absolute; top:0; color: #fff;display:grid; grid-template-columns: 100px 300px;">
//     <div>controls</div>
//     <div style="display: flex; flex-direction: column;">
//       <div>x: ${controls.target[0].toFixed(2)}</div>
//       <div>y: ${controls.target[1].toFixed(2)}</div>
//       <div>z: ${controls.target[2].toFixed(2)}</div>
//     </div>
//     <div>camera</div>
//     <div style="display: flex; flex-direction: column;">
//       <div style="display: flex; flex-direction: column;">
//         <div>x: ${camera.position[0].toFixed(2)}</div>
//         <div>y: ${camera.position[1].toFixed(2)}</div>
//         <div>z: ${camera.position[2].toFixed(2)}</div>
//       </div>
//     </div>
//   </div>`;
// }
