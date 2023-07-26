const opTypes = {
  T: 0,
  K: 1,
  S: 2,
};

const pixToOp = ["K", "T", "S"];

export class Pattern {
  constructor(bitmap) {
    this.width = bitmap.width;
    this.height = bitmap.height;
    this.ops = Array.from(bitmap.vMirror())
      .map((val) => pixToOp[val])
      .toReversed();
  }

  op(x, y) {
    if (x > this.width - 1 || x < 0 || y > this.height - 1 || y < 0) {
      return -1;
    }
    return this.ops.at(x + y * this.width);
  }

  makeOpData() {
    const w = this.width;
    const h = this.height;

    const ops = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const flatIndex = y * w + x;
        const stitch = this.op(x, y);
        // this is the polygon draw order
        const cnIJ = [
          [2 * x, y],
          [2 * x + 1, y],
          [2 * x + 1, y + 1],
          [2 * x, y + 1],
        ];

        ops.push({
          index: flatIndex,
          stitch: stitch,
          op: opTypes[stitch],
          cnIndices: cnIJ.map(([i, j]) => j * 2 * w + i),
        });
      }
    }

    return ops;
  }
}
