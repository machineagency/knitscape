import { Vec2 } from "../lib/Vec2";

export function yarnRelaxation(
  kYarn = 0.05,
  alphaMin = 0.001,
  alphaTarget = 0,
  iterations = 5,
  velocityDecay = 0.5
) {
  let ALPHA = 1;
  let ALPHA_MIN = alphaMin;

  let ALPHA_TARGET = alphaTarget;
  let ALPHA_DECAY = 1 - Math.pow(ALPHA_MIN, 1 / 300);

  let running = true;

  console.log("simulating!!");

  function applyYarnForce(p1, p2, restLength, K_YARN) {
    const displacement = Vec2.sub(p1.pos, p2.pos);

    const currentLength = Vec2.mag(displacement);

    // Yarn does not spring back to rest length
    if (currentLength < restLength) return { x: 0, y: 0 };
    const forceMagnitude = K_YARN * (currentLength - restLength);

    const direction = Vec2.normalize(displacement);

    const force = Vec2.scale(direction, -forceMagnitude * ALPHA);

    p1.f.x += force.x;
    p1.f.y += force.y;

    p2.f.x -= force.x;
    p2.f.y -= force.y;
  }

  function tick(yarnSegments, nodes) {
    let total = 0;

    for (var k = 0; k < iterations; ++k) {
      ALPHA += (ALPHA_TARGET - ALPHA) * ALPHA_DECAY;
      // Accumulate forces to nodes
      Object.entries(yarnSegments).forEach(([yarnIndex, yarnPath]) => {
        yarnPath.forEach(
          ({ sourceIndex, targetIndex, restLength, yarnIndex }) => {
            applyYarnForce(
              nodes[sourceIndex],
              nodes[targetIndex],
              restLength,
              kYarn
            );
          }
        );
      });

      // Update node positions
      nodes.forEach((node) => {
        node.v.x = (node.v.x + node.f.x) * velocityDecay;
        node.v.y = (node.v.y + node.f.y) * velocityDecay;
        node.pos = Vec2.add(node.pos, node.v);
        // sum forces
        total += Vec2.mag(node.f);

        // clear accumulated forces for next tick
        node.f.x = 0;
        node.f.y = 0;
      });
    }

    if (ALPHA < ALPHA_MIN) {
      stop();
    }
  }

  function stop() {
    running = false;
    console.log("Stop!");
    // if (endedCB) endedCB();
  }

  return {
    tick,
    stop,
    alpha: () => ALPHA,
    running: () => running,
  };
}
