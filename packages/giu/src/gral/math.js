// @flow

export type Point2 = { x: number, y: number };

const vectorNorm = (V: Point2): number =>
  Math.sqrt((V.x * V.x) + (V.y * V.y));

const vectorNormalize = (V: Point2): Point2 => {
  const v = vectorNorm(V);
  return vectorMult(V, (1 / v));
};

const vectorCompose = (V1: Point2, alpha: number, V2: Point2, beta: number): Point2 => ({
  x: (alpha * V1.x) + (beta * V2.x),
  y: (alpha * V1.y) + (beta * V2.y),
});

const vectorAdd = (V1: Point2, V2: Point2): Point2 => ({ x: V1.x + V2.x, y: V1.y + V2.y });
const vectorSub = (V1: Point2, V2: Point2): Point2 => ({ x: V1.x - V2.x, y: V1.y - V2.y });
const vectorMult = (V: Point2, alpha: number): Point2 => ({ x: alpha * V.x, y: alpha * V.y });

const vectorRotate = (V: Point2, radians: number): Point2 => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: (cos * V.x) - (sin * V.y),
    y: (sin * V.x) + (cos * V.y),
  };
};

const radToDeg = (radians: number): number => radians / Math.PI * 180;
const degToRad = (deg: number): number => deg / 180 * Math.PI;

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
