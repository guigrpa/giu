const vectorNorm = V => Math.sqrt(V.x * V.x + V.y * V.y);

const vectorNormalize = V => {
  const v = vectorNorm(V);
  return vectorMult(V, (1 / v));
};

const vectorCompose = (V1, alpha, V2, beta) => ({
  x: alpha * V1.x + beta * V2.x,
  y: alpha * V1.y + beta * V2.y,
});

const vectorAdd = (V1, V2) => ({ x: V1.x + V2.x, y: V1.y + V2.y });
const vectorSub = (V1, V2) => ({ x: V1.x - V2.x, y: V1.y - V2.y });
const vectorMult = (V, alpha) => ({ x: alpha * V.x, y: alpha * V.y });

const vectorRotate = (V, radians) => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: cos * V.x - sin * V.y,
    y: sin * V.x + cos * V.y,
  };
};

const radToDeg = radians => radians / Math.PI * 180;
const degToRad = deg => deg / 180 * Math.PI;

// -----------------------------------------------
// Public API
// -----------------------------------------------
export {
  vectorNorm,
  vectorNormalize,
  vectorCompose,
  vectorAdd, vectorSub, vectorMult,
  vectorRotate,
  radToDeg, degToRad,
};
