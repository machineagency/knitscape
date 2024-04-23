import { Vec3 } from "./utils/Vec3";

function torsion(p1, p2, p3, p4) {}

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

  function applyYarnForce(p1, p2, restLength, K_YARN) {
    const displacement = Vec3.subtract(p1.pos, p2.pos);
    const currentLength = Vec3.magnitude(displacement);

    // Yarn does not spring back to rest length
    if (currentLength < restLength) return;

    const forceMagnitude = K_YARN * (currentLength - restLength);

    const direction = Vec3.normalize(displacement);

    const force = Vec3.scale(direction, -forceMagnitude * ALPHA);

    p1.f = Vec3.add(p1.f, force);
    p2.f = Vec3.subtract(p2.f, force);
  }

  function updateContactNodePositions(nodes) {
    nodes.forEach((node) => {
      node.v = Vec3.scale(Vec3.add(node.v, node.f), velocityDecay);
      node.pos = Vec3.add(node.pos, node.v);

      // clear accumulated forces for next tick
      node.f = [0, 0, 0];
    });
  }

  function tick(yarns, nodes) {
    for (var k = 0; k < iterations; ++k) {
      ALPHA += (ALPHA_TARGET - ALPHA) * ALPHA_DECAY;
      // Accumulate forces to nodes
      Object.entries(yarns).forEach(([yarnIndex, segArr]) => {
        for (let segIndex = 0; segIndex < segArr.length; segIndex++) {
          let { source, target, restLength } = segArr[segIndex];
          applyYarnForce(nodes[source], nodes[target], restLength, kYarn);
        }
      });

      updateContactNodePositions(nodes);
    }

    if (ALPHA < ALPHA_MIN) {
      stop();
    }
  }

  function stop() {
    running = false;
  }

  return {
    tick,
    stop,
    alpha: () => ALPHA,
    running: () => running,
  };
}
