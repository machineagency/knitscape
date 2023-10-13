export class Vec2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(that) {
    return new Vec2D(this.x + that.x, this.y + that.y);
  }

  subtract(that) {
    return new Vec2D(this.x - that.x, this.y - that.y);
  }

  divideBy(num) {
    return new Vec2D(this.x / num, this.y / num);
  }

  scaleBy(num) {
    return new Vec2D(this.x * num, this.y * num);
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    return this.scaleBy(1 / this.length());
  }
}
