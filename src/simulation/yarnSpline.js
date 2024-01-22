export function yarnSpline(p0, p1, p2, p3, tension = 0) {
  // Returns control points for a cubic bezier representing the
  // centripetal catmull rom spline passing through p0 - p3

  function dist(pi, pj) {
    return Math.sqrt(Math.hypot(pj.x - pi.x, pj.y - pi.y));
  }

  const t01 = dist(p0, p1);
  const t12 = dist(p1, p2);
  const t23 = dist(p2, p3);

  const m1 = p2
    .subtract(p1)
    .add(
      p1
        .subtract(p0)
        .divideBy(t01)
        .subtract(p2.subtract(p0).divideBy(t01 + t12))
        .scaleBy(t12)
    )
    .scaleBy(1.0 - tension);

  const m2 = p2
    .subtract(p1)
    .add(
      p3
        .subtract(p2)
        .divideBy(t23)
        .subtract(p3.subtract(p1).divideBy(t12 + t23))
        .scaleBy(t12)
    )
    .scaleBy(1.0 - tension);

  return {
    p0: p1,
    p1: p1.add(m1.divideBy(3)),
    p2: p2.subtract(m2.divideBy(3)),
    p3: p2,
  };
}
