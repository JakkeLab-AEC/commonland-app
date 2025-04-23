import { Matrix } from "ml-matrix";
import { Vector2d } from "../../types/vector";
import { getConvexHull } from "./convexHullUtils";

export function getOBB(points: Vector2d[]): { p0: Vector2d, p1: Vector2d, p2: Vector2d, p3: Vector2d } | null {
    const hull = getConvexHull(points);
    const comparables: {area: number, p0: Vector2d, p1: Vector2d, rotation: number, pts: Vector2d[]}[] = [];

    for(let i = 0; i < hull.length; i++) {
        let p0: Vector2d, p1: Vector2d;
        if(i === hull.length - 1) {
            p0 = hull[i];
            p1 = hull[0];
        } else {
            p0 = hull[i];
            p1 = hull[i+1];
        }

        const matrixP0 = getPointMatrix(p0.x, p0.y, 0);
        const matrixP1 = getPointMatrix(p1.x, p1.y, 0);

        const moveMatrix = getMatrixTranslate(-p0.x, -p0.y, 0);

        const origin = moveMatrix.mmul(matrixP0);
        const p1Moved = moveMatrix.mmul(matrixP1);
        
        const p1Direction = Math.atan2(p1Moved.get(1, 0), p1Moved.get(0, 0));
        const rotateMatrix = getMatrixRotationXY(-p1Direction);

        const ptsTransformed: Vector2d[] = hull.map((pt) => {
            const ptMoved = moveMatrix.mmul(getPointMatrix(pt.x, pt.y, 0));
            const ptTransformed = rotateMatrix.mmul(ptMoved);
            return {x: ptTransformed.get(0, 0), y: ptTransformed.get(1, 0)}
        });

        const bb = getBoundingBox(ptsTransformed);

        comparables.push({area: bb.area, p0, p1, rotation: p1Direction, pts: bb.pts});
    }

    const sortedBoundingBoxes = comparables.sort((a, b) => a.area - b.area);

    const minBB = sortedBoundingBoxes[0];

    const resetMatrixRotation = getMatrixRotationXY(minBB.rotation);
    const resetMatrixMove = getMatrixTranslate(minBB.p0.x, minBB.p0.y, 0);

    const restoredPts:Vector2d[] = minBB.pts.map(p => {
        const ptMatrix = getPointMatrix(p.x, p.y, 0);
        const restoredMovedPt = resetMatrixRotation.mmul(ptMatrix);
        const restoredPt = resetMatrixMove.mmul(restoredMovedPt);

        return {x: restoredPt.get(0, 0), y: restoredPt.get(1, 0)}
    });

    return {
        p0: restoredPts[0],
        p1: restoredPts[1],
        p2: restoredPts[2],
        p3: restoredPts[3],
    }
}

function getPointMatrix(x: number, y: number, z: number) {
    return new Matrix([
        [x],
        [y],
        [z],
        [1]
    ])
}

function getMatrixTranslate(dx: number, dy: number, dz: number):Matrix {
    return new Matrix([
        [1, 0, 0, dx],
        [0, 1, 0, dy],
        [0, 0, 1, dz],
        [0, 0, 0, 1]
    ]);
}

function getMatrixRotationXY(theta: number): Matrix {
    return new Matrix([
        [Math.cos(theta), -Math.sin(theta), 0, 0],
        [Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]);
}

function getBoundingBox(pts: Vector2d[]):{area: number, pts: Vector2d[]} {
    const xMin = Math.min(...pts.map(p => p.x));
    const yMin = Math.min(...pts.map(p => p.y));
    const xMax = Math.max(...pts.map(p => p.x));
    const yMax = Math.max(...pts.map(p => p.y));

    const dx = Math.abs(xMax - xMin);
    const dy = Math.abs(yMax - yMin);

    return {
        area: dx*dy, 
        pts: [
            {x: xMin, y: yMin},
            {x: xMax, y: yMin},
            {x: xMax, y: yMax},
            {x: xMin, y: yMax},
        ]
    };
}