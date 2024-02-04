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

// export class Vec2D {
//   constructor(x, y) {
//     this.x = x;
//     this.y = y;
//   }

//   add(that) {
//     return new Vec2D(this.x + that.x, this.y + that.y);
//   }

//   subtract(that) {
//     return new Vec2D(this.x - that.x, this.y - that.y);
//   }

//   divideBy(num) {
//     return new Vec2D(this.x / num, this.y / num);
//   }

//   scaleBy(num) {
//     return new Vec2D(this.x * num, this.y * num);
//   }

//   length() {
//     return Math.hypot(this.x, this.y);
//   }

//   normalize() {
//     return this.scaleBy(1 / this.length());
//   }
// }
