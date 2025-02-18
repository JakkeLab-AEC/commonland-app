import { Vector2d, Vector3d } from "../types/vector";

export function computeConvexHull(points: Vector3d[]): Vector3d[] {
    if (points.length < 3) return points;

    // const sortedPts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    // const p0 = sortedPts[0];
    // const hull: Vector3d[] = [p0];

    // let current = sortedPts[1];
    // let previous = { x: p0.x, y: p0.y, z: p0.z };

    // const usedPoints = new Set<string>();
    // usedPoints.add(`${p0.x},${p0.y}`);
    // usedPoints.add(`${current.x},${current.y}`); // ⭐ 현재 점도 등록

    // while (true) {
    //     const next = findNextPoint(sortedPts, current, previous, usedPoints);

    //     if (!next || usedPoints.has(`${next.x},${next.y}`)) {
    //         break;
    //     }

    //     hull.push(next);
    //     usedPoints.add(`${next.x},${next.y}`);

    //     previous = current;
    //     current = next;

    //     if (next === p0) break;
    // }

    // return hull;
}


// Get cross-product for CCW
export function getCrossProduct(p1: Vector2d, p2: Vector2d): number {
    return p1.x * p2.y - p1.y * p2.x;
}

// CCW determinations
export function getCCW(p0: Vector2d, p1: Vector2d, p2: Vector2d): number {
    return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
}

// Calculate the angle between two vectors (For determinating which one is closer to left-side.)
export function angleBetweenVectors(p0: Vector2d, p1: Vector2d, p2: Vector2d): number {
    const v1: Vector2d = {
        x: p1.x - p0.x,
        y: p1.y - p0.y
    };

    const v2: Vector2d = {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };

    const cross = getCrossProduct(v1, v2);

    const v1Magnitude = Math.hypot(v1.x, v1.y);
    const v2Magnitude = Math.hypot(v2.x, v2.y);

    if (v1Magnitude === 0 || v2Magnitude === 0) return 0;

    const sinTheta = cross / (v1Magnitude * v2Magnitude);
    return Math.asin(sinTheta);
}

// Find the next point (CCW determination, Getting the point closer to left side)
export function findNextPoint(
    pts: Vector3d[],
    current: Vector3d,
    previous: Vector3d,
    usedPoints: Set<string> // 추가된 인자
): Vector3d {
    let next: Vector3d | null = null;

    for (const pt of pts) {
        if (usedPoints.has(`${pt.x},${pt.y}`)) {
            continue; // 이미 사용한 점이면 건너뜀
        }

        if (!next) {
            next = pt;
            continue;
        }

        const cross = getCCW(previous, current, pt);

        if (cross > 0 || (cross === 0 && angleBetweenVectors(previous, current, pt) > angleBetweenVectors(previous, current, next))) {
            next = pt;
        }
    }

    return next!;
}
