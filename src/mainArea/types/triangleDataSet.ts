import { Vector3d } from "./vector";

export type TriangleHash = {hashPt0: string, hashPt1: string, hashPt2: string};
export type PointHash = {hash: string, pt: Vector3d};
export type TriangleSet = {pts: PointHash[], triangles: TriangleHash[]}