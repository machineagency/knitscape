export function yarnSpline(
  [p0x, p0y],
  [p1x, p1y],
  [p2x, p2y],
  [p3x, p3y],
  tension = 0
) {
  // Returns control points for a cubic bezier representing the
  // centripetal catmull rom spline passing through p0 - p3

  function dist([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.hypot(x2 - x1, y2 - y1));
  }

  const t01 = dist([p0x, p0y], [p1x, p1y]);
  const t12 = dist([p1x, p1y], [p2x, p2y]);
  const t23 = dist([p2x, p2y], [p3x, p3y]);

  const m1x =
    (1.0 - tension) *
    (p2x - p1x + t12 * ((p1x - p0x) / t01 - (p2x - p0x) / (t01 + t12)));

  const m1y =
    (1.0 - tension) *
    (p2y - p1y + t12 * ((p1y - p0y) / t01 - (p2y - p0y) / (t01 + t12)));

  const m2x =
    (1.0 - tension) *
    (p2x - p1x + t12 * ((p3x - p2x) / t23 - (p3x - p1x) / (t12 + t23)));

  const m2y =
    (1.0 - tension) *
    (p2y - p1y + t12 * ((p3y - p2y) / t23 - (p3y - p1y) / (t12 + t23)));

  const pF = [p1x + m1x / 3, p1y + m1y / 3];
  const pL = [p2x - m2x / 3, p2y - m2y / 3];
  return [[p1x, p1y], pF, pL, [p2x, p2y]];
}
