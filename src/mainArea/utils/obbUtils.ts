import { Matrix } from "ml-matrix";
import { Vector2d } from "../types/vector";
import { getConvexHull } from "./convexHullUtils";

export function computeOBB(points: Vector2d[]): { center: Vector2d; size: Vector2d; angle: number } | null {
    const hull = getConvexHull(points);
    if (hull.length < 2) return null;

    let obb: { center: Vector2d; size: Vector2d; angle: number } | null = null;
    let minArea = Infinity;

    for (let i = 0; i < hull.length; i++) {
        const p0 = hull[i];
        const p1 = hull[(i + 1) % hull.length]; // Wrap around to the first point

        const xAxis = { x: p1.x - p0.x, y: p1.y - p0.y };

        // Handle zero-length edges
        const edgeLengthSquared = xAxis.x * xAxis.x + xAxis.y * xAxis.y;
        if (edgeLengthSquared === 0) continue;

        const origin = p0; // No need to check direction anymore

        const theta = Math.asin(xAxis.y / Math.hypot(xAxis.x, xAxis.y));
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        const matrixT = new Matrix([
            [1, 0, 0, -origin.x],
            [0, 1, 0, -origin.y],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);

        const matrixR = new Matrix([
            [cosTheta, -sinTheta, 0, 0],
            [sinTheta, cosTheta, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);

        const matrixTransform = matrixR.mmul(matrixT);

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const pt of hull) { // Use for...of loop for cleaner iteration
            const ptArr = new Matrix([[pt.x], [pt.y], [0], [1]]);
            const ptTransformed = matrixTransform.mmul(ptArr);
            const transformedX = ptTransformed.get(0, 0);
            const transformedY = ptTransformed.get(1, 0);

            minX = Math.min(minX, transformedX);
            minY = Math.min(minY, transformedY);
            maxX = Math.max(maxX, transformedX);
            maxY = Math.max(maxY, transformedY);
        }

        const area = (maxX - minX) * (maxY - minY);

        if (obb === null || area < minArea) {
            minArea = area;
            const centerLocal = new Matrix([[(minX + maxX) / 2], [(minY + maxY) / 2], [0], [1]]);

            const matrixR_inv = new Matrix([
                [cosTheta, sinTheta, 0, 0], // Note the change here for inverse rotation
                [-sinTheta, cosTheta, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ]);

            const matrixT_inv = new Matrix([
                [1, 0, 0, origin.x],
                [0, 1, 0, origin.y],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ]);

            const matrixInvTransform = matrixT_inv.mmul(matrixR_inv);
            const centerTransformed = matrixInvTransform.mmul(centerLocal);
            const center = { x: centerTransformed.get(0, 0), y: centerTransformed.get(1, 0) };

            obb = {
                center,
                size: { x: maxX - minX, y: maxY - minY },
                angle: theta * (180 / Math.PI),
            };
        }
    }

    return obb;
}