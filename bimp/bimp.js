"use strict";

export class Bimp {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(pixels);
  }

  static empty(width, height, color) {
    let pixels = new Array(width * height).fill(color);
    return new Bimp(width, height, pixels);
  }

  static fromTile(width, height, tile) {
    // tile should be a Bimp

    let tiled = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        tiled.push(tile.pixel(x % tile.width, y % tile.height));
      }
    }

    return new Bimp(width, height, tiled);
  }

  resize(width, height) {
    let resized = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y >= this.height || x >= this.width) {
          resized.push(0);
        } else {
          resized.push(this.pixel(x, y));
        }
      }
    }
    return new Bimp(width, height, resized);
  }

  make2d() {
    let copy = Array.from(this.pixels).slice();
    let newArray = [];
    while (copy.length > 0) newArray.push(copy.splice(0, this.width));
    return newArray;
  }

  vMirror() {
    // let arr2d = this.make2d();
    return this.make2d()
      .map((row) => row.toReversed())
      .flat();
  }

  pixel(x, y) {
    if (x > this.width - 1 || x < 0 || y > this.height - 1 || y < 0) {
      return -1;
    }
    return this.pixels.at(x + y * this.width);
  }

  draw(changes) {
    let copy = this.pixels.slice();
    for (let { x, y, color } of changes) {
      copy[x + y * this.width] = color;
    }
    return new Bimp(this.width, this.height, copy);
  }

  brush({ x, y }, color) {
    let drawn = { x, y, color: color };
    return this.draw([drawn]);
  }

  flood({ x, y }, color) {
    const around = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];
    let targetColor = this.pixel(x, y);
    let drawn = [{ x, y, color: color }];
    for (let done = 0; done < drawn.length; done++) {
      for (let { dx, dy } of around) {
        let x = drawn[done].x + dx,
          y = drawn[done].y + dy;
        if (
          x >= 0 &&
          x < this.width &&
          y >= 0 &&
          y < this.height &&
          this.pixel(x, y) == targetColor &&
          !drawn.some((p) => p.x == x && p.y == y)
        ) {
          drawn.push({ x, y, color: color });
        }
      }
    }
    return this.draw(drawn);
  }

  shift(dx, dy) {
    console.log(dx, dy);
    let changes = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        changes.push({
          x: (x - dx) % this.width,
          y: (y - dy) % this.height,
          color: this.pixel(x, y),
        });
      }
    }

    return this.draw(changes);
  }

  rect(start, end, color) {
    let xStart = Math.min(start.x, end.x);
    let yStart = Math.min(start.y, end.y);
    let xEnd = Math.max(start.x, end.x);
    let yEnd = Math.max(start.y, end.y);
    let changes = [];

    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        changes.push({ x, y, color });
      }
    }
    return this.draw(changes);
  }

  line(from, to, color) {
    let changes = [];
    if (Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
      if (from.x > to.x) [from, to] = [to, from];
      let slope = (to.y - from.y) / (to.x - from.x);
      for (let { x, y } = from; x <= to.x; x++) {
        changes.push({ x, y: Math.round(y), color });
        y += slope;
      }
    } else {
      if (from.y > to.y) [from, to] = [to, from];
      let slope = (to.x - from.x) / (to.y - from.y);
      for (let { x, y } = from; y <= to.y; y++) {
        changes.push({ x: Math.round(x), y, color });
        x += slope;
      }
    }
    return this.draw(changes);
  }
}

export class BimpCanvas {
  constructor(bitmap, palette) {
    this.bitmap = null;
    this.palette = palette;

    this.offscreenCanvas = new OffscreenCanvas(
      bitmap.width * this.palette.scale[0],
      bitmap.height * this.palette.scale[1]
    );
    this.ctx = this.offscreenCanvas.getContext("2d");

    this.updateOffscreenCanvas(bitmap, palette);
  }

  updateOffscreenCanvas(newBitmap, newPalette) {
    if (this.bitmap == newBitmap) return;
    this.draw(newBitmap, newPalette);
    this.bitmap = newBitmap;
    this.palette = newPalette;
  }

  transferOffscreenToCanvas(canvas) {
    if (!this.bitmap || this.bitmap.width == 0 || this.bitmap.height == 0)
      return;
    canvas.width = this.bitmap.width * this.palette.scale[0];
    canvas.height = this.bitmap.height * this.palette.scale[1];
    // context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    try {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(this.offscreenCanvas, 0, 0);
    } catch (e) {
      console.log("error drawing to canvas");
    }
  }

  draw(newBitmap, newPalette) {
    // Attempts to draw only the pixels that have changed if there is
    // a previous bitmap specified

    // If there is a previous canvas (or previous is a different size)
    if (
      this.bitmap == null ||
      this.bitmap.width != newBitmap.width ||
      this.bitmap.height != newBitmap.height
    ) {
      this.offscreenCanvas.width = newBitmap.width * this.palette.scale[0];
      this.offscreenCanvas.height = newBitmap.height * this.palette.scale[1];
      this.bitmap = null;
    }

    for (let y = 0; y < newBitmap.height; y++) {
      for (let x = 0; x < newBitmap.width; x++) {
        let paletteIndex = newBitmap.pixel(x, y);

        if (this.bitmap == null || this.bitmap.pixel(x, y) != paletteIndex) {
          this.ctx.translate(
            x * this.palette.scale[0],
            y * this.palette.scale[1]
          );

          newPalette.draw(paletteIndex, this.ctx, x, y);

          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    }
  }
}
