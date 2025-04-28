import { ZPoints } from "./predictedPoint";
import { Vector2d } from "./vector";

export type Index2d = {i: number, j: number};
export type TriangleIndicies = {p0: Index2d, p1: Index2d, p2: Index2d};
export type PointZIndexed = {index: Index2d, z: number};
export type TriangleSet = {
    pts: ZPoints[], 
    anchor: Vector2d, 
    rotation: number, 
    resolution: number,
    maxI: number,
    maxJ: number,
}