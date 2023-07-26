class Palette {
  constructor(entries, scale, drawFunc, bitDepth) {
    if (bitDepth) {
      if (Math.log2(entries.length) > bitDepth) {
        throw new Error(
          "Error creating Palette: too many entries for specified bit depth"
        );
      }
      this.bitDepth = bitDepth;
    } else {
      this.bitDepth = Math.ceil(Math.log2(entries.length));
    }

    this.entries = entries.map((entry) => {
      if (typeof entry != typeof entries[0]) {
        throw new Error("All palette entries must be the same type!");
      }
      return entry;
    });

    this.scale = scale ?? [1, 1];

    this.drawFunc = drawFunc;
  }

  addEntry(entry) {
    this.entries.push(entry);
  }

  static getRGB([r, g, b]) {
    try {
      return `rgb(${r} ${g} ${b})`;
    } catch (e) {
      console.warn("Can't destructure palette entries to RGB");
      return `rgb(0 0 0)`;
    }
  }

  getRGBA(index) {
    try {
      const [r, g, b, a] = this.entries[index];
      return `rgb(${r} ${g} ${b} / ${a})`;
    } catch (e) {
      console.warn("Can't destructure palette entries to RGBA");
      return `rgb(0 0 0 / 0)`;
    }
  }

  draw(paletteIndex, ctx, x, y) {
    // a method to draw the specified palette index
    try {
      this.drawFunc(ctx, this.entries[paletteIndex], x, y, paletteIndex);
    } catch (e) {
      console.error("Error in palette draw function!", e);
    }
  }
}

class PixelPalette extends Palette {
  constructor(entries) {
    super(entries, [1, 1]);
    this.drawFunc = this.drawPixel;
  }

  drawPixel(ctx, value, x, y) {
    ctx.fillStyle = Palette.getRGB(value);
    ctx.fillRect(0, 0, 1, 1);
  }
}

const p2 = [
  [0, 0, 0],
  [255, 255, 255],
];

const p4 = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const p8 = [
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 255, 255],
];

const p16 = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
  [1, 1, 1],
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
  [1, 1, 1],
];

function dots(ctx, value, x, y) {
  ctx.fillStyle = Palette.getRGB(value);
  ctx.beginPath();
  ctx.arc(
    this.scale[0] / 2,
    this.scale[1] / 2,
    Math.abs(this.scale[0] / 2 - x),
    0,
    2 * Math.PI
  );

  ctx.fill();
}

function shrinkingDots(ctx, value, x, y) {
  ctx.fillStyle = Palette.getRGB(value);
  ctx.beginPath();
  ctx.arc(
    this.scale[0] / 2,
    this.scale[1] / 2,
    Math.abs(this.scale[0] - (x * y) / 4),
    0,
    2 * Math.PI
  );

  ctx.fill();
}

const stitches = [
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
];

function makeLinGrad(ctx, start, stop, c1, c2) {
  const grad = ctx.createLinearGradient(start[0], start[1], stop[0], stop[1]);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  return grad;
}

function stitchesDraw(ctx, value, x, y, paletteIndex) {
  // Create gradients

  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#ff9e0d";
  ctx.fillStyle = "#404040";

  const btm = [this.scale[0] / 4, (3 * this.scale) / 4];
  // background
  ctx.fillRect(0, 0, this.scale[0], this.scale[0]);
  const LIGHT = "#ff9e0d";
  const DARK = "#cf7e06";

  if (paletteIndex == 0) {
    // KNIT

    // top left under
    const lstart = [0, 85];
    const lstop = [40, 60];
    const lgrad = makeLinGrad(ctx, lstart, lstop, DARK, LIGHT);
    ctx.strokeStyle = lgrad;

    ctx.beginPath();
    ctx.moveTo(lstart[0], lstart[1]);
    ctx.bezierCurveTo(25, 85, 30, 75, lstop[0], lstop[1]);
    ctx.stroke();

    // top right under

    const rstart = [100, 85];
    const rstop = [60, 60];
    const rgrad = makeLinGrad(ctx, rstart, rstop, DARK, LIGHT);
    ctx.strokeStyle = rgrad;
    ctx.beginPath();
    ctx.moveTo(rstart[0], rstart[1]);
    ctx.bezierCurveTo(75, 85, 70, 75, rstop[0], rstop[1]);
    ctx.stroke();

    // bottom part
    const cgrad = makeLinGrad(ctx, [50, 25], [50, 75], DARK, LIGHT);
    ctx.strokeStyle = cgrad;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.bezierCurveTo(0, 0, 100, 0, 80, 100);
    ctx.stroke();
    ctx.strokeStyle = LIGHT;

    // top left
    ctx.beginPath();
    ctx.moveTo(lstop[0], lstop[1]);
    ctx.bezierCurveTo(50, 20, 20, 20, 20, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rstop[0], rstop[1]);
    ctx.bezierCurveTo(50, 20, 80, 20, 80, 0);
    ctx.stroke();
  } else if (paletteIndex == 1) {
    // SLIP
    ctx.strokeStyle = DARK;

    // bottom part
    ctx.beginPath();
    ctx.moveTo(0, 85);
    ctx.lineTo(100, 85);
    ctx.stroke();
    ctx.strokeStyle = LIGHT;

    // left part
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(20, 0);
    ctx.stroke();

    // right part
    ctx.beginPath();
    ctx.moveTo(80, 100);
    ctx.lineTo(80, 0);
    ctx.stroke();
  }
}

function squares(ctx, value) {
  ctx.fillStyle = Palette.getRGB(value);
  ctx.fillRect(0, 0, 1, 1);
}

const palette2 = new Palette(p2, [20, 20]);
const palette4 = new Palette(p4, [20, 20]);

const palette16 = new Palette(p16, [20, 20]);

const pixel2 = new PixelPalette(p2);
const colorP2 = new PixelPalette([
  [0, 87, 72],
  [91, 240, 203],
  [0, 0, 0],
  [0, 255, 255],
]);

const pixel8 = new PixelPalette(p8);

const dotPalette = new Palette(p2, [100, 100], dots);
const stitchPalette = new Palette(p2, [100, 100], stitchesDraw);
const booleanMask = new Palette(p2, [1, 1], squares);

export {
  pixel8,
  pixel2,
  colorP2,
  dotPalette,
  stitchPalette,
  booleanMask,
  Palette,
  PixelPalette,
};
