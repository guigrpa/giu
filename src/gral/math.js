// @flow

import type {
  Point2T,
}                           from '../gral/types';

const vectorNorm = (V: Point2T): number =>
  Math.sqrt(V.x * V.x + V.y * V.y);

const vectorNormalize = (V: Point2T): Point2T => {
  const v = vectorNorm(V);
  return vectorMult(V, (1 / v));
};

const vectorCompose = (V1: Point2T, alpha: number, V2: Point2T, beta: number): Point2T => ({
  x: alpha * V1.x + beta * V2.x,
  y: alpha * V1.y + beta * V2.y,
});

const vectorAdd = (V1: Point2T, V2: Point2T): Point2T => ({ x: V1.x + V2.x, y: V1.y + V2.y });
const vectorSub = (V1: Point2T, V2: Point2T): Point2T => ({ x: V1.x - V2.x, y: V1.y - V2.y });
const vectorMult = (V: Point2T, alpha: number): Point2T => ({ x: alpha * V.x, y: alpha * V.y });

const vectorRotate = (V: Point2T, radians: number): Point2T => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: cos * V.x - sin * V.y,
    y: sin * V.x + cos * V.y,
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
