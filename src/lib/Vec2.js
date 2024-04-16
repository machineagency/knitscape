export const Vec2 = {
  add(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },

  sub(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  },

  scale(vec, scalar) {
    return {
      x: vec.x * scalar,
      y: vec.y * scalar,
    };
  },

  abs(vec) {
    return {
      x: Math.abs(vec.x),
      y: Math.abs(vec.y),
    };
  },

  mag(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  },

  dot(a, b) {
    return a.x * b.x + a.y * b.y;
  },

  normalize(vec) {
    return this.scale(vec, 1 / this.mag(vec));
  },
};
