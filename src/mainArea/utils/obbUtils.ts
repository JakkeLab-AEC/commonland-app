import { Matrix } from "ml-matrix";
import { Vector2d } from "../types/vector";
import { getConvexHull } from "./convexHullUtils";

export function computeOBB(points: Vector2d[]): { center: Vector2d; size: Vector2d; angle: number } | null {

    const hull = getConvexHull(points);
    if (hull.length < 2) return null;

    let obb: { center: Vector2d; size: Vector2d; angle: number } | null = null;
    let minArea = Infinity;

    let p0: Vector2d;
    let p1: Vector2d;
    
    const areas: number[] = [];
    for (let i = 0; i < hull.length; i++) {
        if(i === hull.length - 1) {
            p0 = hull[i];
            p1 = hull[0];
        } else {
            p0 = hull[i];
            p1 = hull[i+1];
        }

        let xAxis: Vector2d;
        let origin: Vector2d;
        const vec = { x: p1.x - p0.x, y: p1.y - p0.y };
        if(vec.x < 0) {
            xAxis = { x: -vec.x, y: -vec.y }
            origin = { x: p1.x, y: p1.y }
        } else {
            xAxis = { x: vec.x, y: vec.y }
            origin = { x: p0.x, y: p0.y }
        }

        // Handle zero-length edges
        const edgeLengthSquared = xAxis.x * xAxis.x + xAxis.y * xAxis.y;
        if (edgeLengthSquared === 0) continue;

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

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const pt of hull) {
            const ptArr = new Matrix([[pt.x], [pt.y], [0], [1]]);
            const ptTranslated = matrixT.mmul(ptArr);
            const ptRotated = matrixR.mmul(ptTranslated);
            const transformedX = ptRotated.get(0, 0);
            const transformedY = ptRotated.get(1, 0);

            minX = Math.min(minX, transformedX);
            minY = Math.min(minY, transformedY);
            maxX = Math.max(maxX, transformedX);
            maxY = Math.max(maxY, transformedY);
        }

        const area = (maxX - minX) * (maxY - minY);
        areas.push(area);
        if (obb === null || area < minArea) {
            minArea = area;
            const centerLocal = new Matrix([[(minX + maxX) / 2], [(minY + maxY) / 2], [0], [1]]);

            const matrixR_inv = new Matrix([
                [cosTheta, sinTheta, 0, 0],
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

            const ptInvRotated = matrixR_inv.mmul(centerLocal);
            const ptInvTranslated = matrixT_inv.mmul(ptInvRotated);

            const center = { x: ptInvTranslated.get(0, 0), y: ptInvTranslated.get(1, 0) };

            obb = {
                center,
                size: { x: maxX - minX, y: maxY - minY },
                angle: theta * (180 / Math.PI),
            };
        }
    }

    return obb;
}