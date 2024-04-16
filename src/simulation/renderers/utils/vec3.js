export const Vec3 = {
  // dot(a, b) {
  //   return a.x * b.x + a.y * b.y + a.z * b.z;
  // },

  // cross(a, b) {
  //   return {
  //     x: a.y * b.z - a.z * b.y,
  //     y: a.z * b.x - a.x * b.z,
  //     z: a.x * b.y - a.y * b.x,
  //   };
  // },

  // normalize(vec) {
  //   const len = Math.sqrt(Vec3.dot(vec, vec));
  //   return { x: vec.x / len, y: vec.y / len, z: vec.z / len };
  // },

  // add(a, b) {
  //   return {
  //     x: a.x + b.x,
  //     y: a.y + b.y,
  //     z: a.z + b.z,
  //   };
  // },

  // mul(a, mag) {
  //   return {
  //     x: a.x * mag,
  //     y: a.y * mag,
  //     z: a.z * mag,
  //   };
  // },

  add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  },

  subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  },

  dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  },

  scale(v, scalar) {
    return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
  },

  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  },

  length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  },

  normalize(v) {
    const length = Vec3.length(v);
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }
  },
};
