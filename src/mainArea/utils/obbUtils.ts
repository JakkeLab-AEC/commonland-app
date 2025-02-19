import { Vector2d } from "../types/vector";
import { getConvexHull } from "./convexHullUtils";
import nj from 'numjs';

export function computeOBB(points: Vector2d[]): { center: Vector2d; size: Vector2d; angle: number } | null {
    const hull = getConvexHull(points);
    if (hull.length < 2) return null;

    let obb: { center: Vector2d; size: Vector2d; angle: number };
    let obbSize: number;
    for(let i = 0; i < hull.length; i++) {
        let p0: Vector2d;
        let p1: Vector2d;
        if(i === hull.length - 1) {
            p0 = hull[i];
            p1 = hull[0];
        } else {
            p0 = hull[i];
            p1 = hull[i+1];
        }
        
        let xAxis: Vector2d;
        let origin: Vector2d;
        const p0p1: Vector2d = {x: p1.x - p0.x, y: p1.y - p0.y};
        if(p0p1.x < 0) {
            xAxis = {x: p0.x - p1.x, y: p0.y - p1.y};
            origin = {x: p1.x, y: p1.y};
        } else {
            xAxis = {x: p1.x - p0.x, y: p1.y - p0.y};
            origin = {x: p0.x, y: p0.y};
        }

        // Get axis angle
        const theta = Math.asin(xAxis.y / Math.hypot(xAxis.x, xAxis.y));

        // Create TRS Matrix
        const matrixT = nj.array([
            [1, 0, 0, -origin.x],
            [0, 1, 0, -origin.y],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);

        const matrixR = nj.array([
            [nj.cos(theta), -nj.sin(theta), 0, 0],
            [nj.sin(theta), nj.cos(theta), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);

        const matrixTransform = nj.dot(matrixT, matrixR);

        // Apply transform at each point and get min and max coordinates.
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for(let j = 0; j < hull.length; j++) {
            const pt = hull[j];
            const ptArr = nj.array([
                [pt.x],
                [pt.y],
                [0],
                [1]
            ]);

            const ptTransformed = nj.dot(matrixTransform, ptArr);
            const transformedX = Number(ptTransformed.get(0, 0));
            const transformedY = Number(ptTransformed.get(1, 0));

            minX = Math.min(minX, transformedX);
            minY = Math.min(minY, transformedY);
            maxX = Math.max(maxX, transformedX);
            maxY = Math.max(maxY, transformedY);
        }

        const area = (maxX - minX)*(maxY - minY);

        const centerLocal = nj.array([
            [(minX + maxX) / 2],
            [(minY + maxY) / 2],
            [0],
            [1]
        ]);

        const matrixR_inv = nj.array([
            [Math.cos(-theta), -Math.sin(-theta), 0, 0],
            [Math.sin(-theta), Math.cos(-theta), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);

        const matrixT_inv = nj.array([
            [1, 0, 0, origin.x],
            [0, 1, 0, origin.y],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);

        const matrixInvTransform = nj.dot(matrixT_inv, matrixR_inv);
        const centerTransformed = nj.dot(matrixInvTransform, centerLocal);
        const center = { x: Number(centerTransformed.get(0, 0)), y: Number(centerTransformed.get(1, 0)) };
        
        // Refresh OBB
        if (i === 0 || obbSize > area) {
            obbSize = area;
            obb = {
                center,
                size: { x: maxX - minX, y: maxY - minY },
                angle: theta * (180 / Math.PI)  // Degree
            };
        }
    }

    return obb;
}