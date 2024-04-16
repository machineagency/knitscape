import {
  Renderer,
  Transform,
  Program,
  Camera,
  Orbit,
  Vec3,
  Color,
  Geometry,
  Mesh,
} from "ogl";

const OUTLINE_WIDTH = 0.05;
let gl, controls, renderer, camera, scene;

let yarnPoints = [];
let yarnGeometry = [];
let yarnColors = [];

const vertexShader = /* glsl */ `
precision highp float;
// position in the instance geometry
attribute vec3 position;

// two endpoints of a yarn segment
attribute vec3 pointA;
attribute vec3 pointB;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;


uniform float uWidth;
uniform float uZMin;
uniform float uZMax;

varying float vZ;

void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;

  // The segment endpoint positions in clip space
  vec4 clip0 = mvp * vec4(pointA, 1.0);
  vec4 clip1 = mvp * vec4(pointB, 1.0);

  // This is our position in the instance geometry. the x component is along the line segment
  vec2 xBasis = normalize(clip1.xy - clip0.xy); // vector between clip0 and clip1
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);

  // position.x is either 0 or 1
  // position.y is either -0.5 or + 0.5
  // position.z is either 0 or 1

  vec2 pt0 = clip0.xy + uWidth * (position.x * xBasis + position.y * yBasis);
  vec2 pt1 = clip1.xy + uWidth * (position.x * xBasis + position.y * yBasis);

  vec2 pt = mix(pt0, pt1, position.z);

  vec4 clip = mix(clip0, clip1, position.z);

  gl_Position = vec4(pt, clip.z, clip.w);


  // Use the z component of the current point to shade the point according to the z range
  float whichZ = mix(pointA.z, pointB.z, position.z);
  vZ = abs(whichZ-uZMin) / abs(uZMax-uZMin);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColor;
varying float vZ;

void main() {
    vec3 shaded = uColor - 0.4;

    gl_FragColor.rgb = mix(shaded, uColor, vZ);
    gl_FragColor.a = 1.0;
}
`;

const outlineVertexShader = /* glsl */ `
precision highp float;
// position in the instance geometry
attribute vec3 position;

// two endpoints of a yarn segment
attribute vec3 pointA;
attribute vec3 pointB;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;


uniform float uWidth;

varying float vZ;

void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;

  // The segment endpoint positions in clip space
  vec4 clip0 = mvp * vec4(pointA, 1.0);
  vec4 clip1 = mvp * vec4(pointB, 1.0);

  // This is our position in the instance geometry. the x component is along the line segment
  vec2 xBasis = normalize(clip1.xy - clip0.xy); // vector between clip0 and clip1
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);

  vec2 pt0 = clip0.xy + uWidth * (position.x * xBasis + position.y * yBasis);
  vec2 pt1 = clip1.xy + uWidth * (position.x * xBasis + position.y * yBasis);

  vec2 pt = mix(pt0, pt1, position.z);

  vec4 clip = mix(clip0, clip1, position.z);

  gl_Position = vec4(pt, clip.z, clip.w);
}
`;

const outlineFragmentShader = /* glsl */ `
precision highp float;
uniform vec3 uColor;

void main() {
    gl_FragColor = vec4(uColor, 1.0);
}
`;

const joinVertexShader = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 pointA;
attribute vec3 pointB;
attribute vec3 pointC;

uniform float uWidth;
uniform float uZMin;
uniform float uZMax;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying float vZ;

void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;

  vec4 clipA = mvp * vec4(pointA, 1.0);
  vec4 clipB = mvp * vec4(pointB, 1.0);
  vec4 clipC = mvp * vec4(pointC, 1.0);

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

  gl_Position = vec4(clip, clipB.z, clipB.w);

  vZ = abs(pointB.z-uZMin) / abs(uZMax-uZMin);
}
`;

const joinFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColor;
varying float vZ;

void main() {
    vec3 shaded = uColor - 0.4;

    gl_FragColor.rgb = mix(shaded, uColor, vZ);
    gl_FragColor.a = 1.0;
}
`;

function catmullRom(p0, p1, p2, p3, alpha = 0.5, t = 0) {
  let t01 = p0.distance(p1);
  let t12 = p1.distance(p2);
  let t23 = p2.distance(p3);

  const m1x =
    (1.0 - t) *
    (p2[0] -
      p1[0] +
      t12 * ((p1[0] - p0[0]) / t01 - (p2[0] - p0[0]) / (t01 + t12)));

  const m1y =
    (1.0 - t) *
    (p2[1] -
      p1[1] +
      t12 * ((p1[1] - p0[1]) / t01 - (p2[1] - p0[1]) / (t01 + t12)));

  const m1z =
    (1.0 - t) *
    (p2[2] -
      p1[2] +
      t12 * ((p1[2] - p0[2]) / t01 - (p2[2] - p0[2]) / (t01 + t12)));

  const m2x =
    (1.0 - t) *
    (p2[0] -
      p1[0] +
      t12 * ((p3[0] - p2[0]) / t23 - (p3[0] - p1[0]) / (t12 + t23)));

  const m2y =
    (1.0 - t) *
    (p2[1] -
      p1[1] +
      t12 * ((p3[1] - p2[1]) / t23 - (p3[1] - p1[1]) / (t12 + t23)));

  const m2z =
    (1.0 - t) *
    (p2[2] -
      p1[2] +
      t12 * ((p3[2] - p2[2]) / t23 - (p3[2] - p1[2]) / (t12 + t23)));

  const m1 = new Vec3(m1x, m1y, m1z);
  const m2 = new Vec3(m2x, m2y, m2z);

  // const m1 = p2
  //   .clone()
  //   .sub(
  //     p1.clone().add(
  //       p1
  //         .clone()
  //         .sub(p0)
  //         .divide(t01)
  //         .sub(
  //           p2
  //             .clone()
  //             .sub(p0)
  //             .divide(t01 + t12)
  //         )
  //         .multiply(t12)
  //     )
  //   )
  //   .multiply(1.0 - t);

  // const m2 = p2
  //   .clone()
  //   .sub(
  //     p1.clone().add(
  //       p3
  //         .clone()
  //         .sub(p2)
  //         .divide(t23)
  //         .sub(
  //           p3
  //             .clone()
  //             .sub(p1)
  //             .divide(t12 + t23)
  //         )
  //         .multiply(t12)
  //     )
  //   )
  //   .multiply(1.0 - t);

  return {
    a: p1.clone().sub(p2).multiply(2.0).add(m1).add(m2),
    b: p1.clone().sub(p2).multiply(-3.0).sub(m1).sub(m1).sub(m2),
    c: m1.clone(),
    d: p1.clone(),
  };
}

function pointInSegment(seg, t) {
  return seg.a
    .clone()
    .multiply(t * t * t)
    .add(seg.b.clone().multiply(t * t))
    .add(seg.c.clone().multiply(t))
    .add(seg.d.clone());
}

function buildYarnCurve(pts, divisions = 5) {
  let vec3arr = [];

  for (let i = 0; i < pts.length - 9; i += 3) {
    let cp1 = new Vec3(pts[i + 0], pts[i + 1], pts[i + 2]);
    let p1 = new Vec3(pts[i + 3], pts[i + 4], pts[i + 5]);
    let p2 = new Vec3(pts[i + 6], pts[i + 7], pts[i + 8]);
    let cp2 = new Vec3(pts[i + 9], pts[i + 10], pts[i + 11]);
    const coefficients = catmullRom(cp1, p1, p2, cp2, 0, 0.5);

    for (let t = 0; t < 1; t += 1 / divisions) {
      vec3arr.push(pointInSegment(coefficients, t));
    }
  }

  return new Float32Array(vec3arr.map((pt) => pt.toArray()).flat());
}

function buildYarnSegmentGeometry(splinePts, pointBuffer) {
  const instanceCount = splinePts.length / 3 - 1;

  const instanceGeometry = [
    [0, -0.5, 0],
    [0, -0.5, 1],
    [0, 0.5, 0],
    [0, 0.5, 1],
  ];

  const geometry = new Geometry(gl, {
    position: {
      size: 3,
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
    camera.position.set(center[0], center[1], 50);

    controls = new Orbit(camera, {
      target: new Vec3(center[0], center[1], 0),
      element: canvas,
    });
    camera.lookAt(controls.target);
  }

  resize();
  scene = new Transform();

  yarnPoints = [];
  yarnGeometry = [];

  yarnData.forEach((yarn) => {
    if (yarn.pts.length < 6) return;

    const splinePts = buildYarnCurve(yarn.pts);

    yarnPoints.push(splinePts);

    const pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, splinePts, gl.STATIC_DRAW);

    const geometry = buildYarnSegmentGeometry(splinePts, pointBuffer);
    const joinGeometry = buildJoinGeometry(splinePts, pointBuffer);

    yarnGeometry.push(geometry);

    geometry.computeBoundingBox(geometry.attributes.pointA);

    const outlineColor = new Color(0, 0, 0);
    yarnColors.push(yarn.color);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uWidth: { value: yarn.radius },
        uColor: { value: yarn.color },
        uZMin: { value: geometry.bounds.min[2] },
        uZMax: { value: geometry.bounds.max[2] },
      },
    });

    const mesh = new Mesh(gl, {
      mode: gl.TRIANGLE_STRIP,
      geometry,
      program,
    });

    const joinProgram = new Program(gl, {
      vertex: joinVertexShader,
      fragment: joinFragmentShader,
      uniforms: {
        uColor: { value: yarn.color },
        uWidth: { value: yarn.radius },
        uZMin: { value: geometry.bounds.min[2] },
        uZMax: { value: geometry.bounds.max[2] },
      },
    });

    const joinMesh = new Mesh(gl, {
      geometry: joinGeometry,
      program: joinProgram,
    });
    mesh.setParent(scene);
    joinMesh.setParent(scene);

    mesh.onBeforeRender(() => gl.polygonOffset(1, 1));
    joinMesh.onBeforeRender(() => gl.polygonOffset(1, 1));

    const outlineProgram = new Program(gl, {
      vertex: outlineVertexShader,
      fragment: outlineFragmentShader,
      uniforms: {
        uColor: { value: outlineColor },
        uWidth: { value: yarn.radius + OUTLINE_WIDTH },
      },
    });

    const joinOutlineProgram = new Program(gl, {
      vertex: joinVertexShader,
      fragment: joinFragmentShader,
      uniforms: {
        uColor: { value: outlineColor },
        uWidth: { value: yarn.radius + OUTLINE_WIDTH },
        uZMin: { value: geometry.bounds.min[2] },
        uZMax: { value: geometry.bounds.max[2] },
      },
    });

    const outlineMesh = new Mesh(gl, {
      mode: gl.TRIANGLE_STRIP,
      geometry,
      program: outlineProgram,
    });

    const joinOutlineMesh = new Mesh(gl, {
      mode: gl.TRIANGLES,
      geometry: joinGeometry,
      program: joinOutlineProgram,
    });

    outlineMesh.onBeforeRender(() => gl.polygonOffset(2, 1));
    joinOutlineMesh.onBeforeRender(() => gl.polygonOffset(2, 1));

    joinOutlineMesh.setParent(scene);
    outlineMesh.setParent(scene);
  });
}

function monitorView() {
  return html`<div
    style="position: absolute; top:0; color: #fff;display:grid; grid-template-columns: 100px 300px;">
    <div>controls</div>
    <div style="display: flex; flex-direction: column;">
      <div>x: ${controls.target[0].toFixed(2)}</div>
      <div>y: ${controls.target[1].toFixed(2)}</div>
      <div>z: ${controls.target[2].toFixed(2)}</div>
    </div>
    <div>camera</div>
    <div style="display: flex; flex-direction: column;">
      <div style="display: flex; flex-direction: column;">
        <div>x: ${camera.position[0].toFixed(2)}</div>
        <div>y: ${camera.position[1].toFixed(2)}</div>
        <div>z: ${camera.position[2].toFixed(2)}</div>
      </div>
    </div>
  </div>`;
}

function resize() {
  renderer.setSize(gl.canvas.clientWidth, gl.canvas.clientHeight);
  camera.perspective({
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
  });
}

function updateYarnGeometry(yarnData) {
  yarnData.forEach((yarn, yarnIndex) => {
    const splinePts = buildYarnCurve(yarn.pts);

    // Update the points in the yarn's point array
    splinePts.forEach((p, i) => (yarnPoints[yarnIndex][i] = p));

    // Flag for update
    yarnGeometry[yarnIndex].attributes.pointA.needsUpdate = true;
    yarnGeometry[yarnIndex].attributes.pointB.needsUpdate = true;
  });
}

function draw() {
  controls.update();

  renderer.render({ scene, camera });
}

export const noodleRenderer = {
  draw,
  init,
  updateYarnGeometry,
};
