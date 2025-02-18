import { Vector2d } from "../types/vector";

export function getConvexHull(points: Vector2d[]): Vector2d[] {
    if (points.length < 3) {
        throw new Error("Convex Hull requires at least 3 points.");
    }

    // 가장 왼쪽 아래 점 찾기 (시작점)
    const start = points.reduce((min, p) => (p.x < min.x || (p.x === min.x && p.y < min.y)) ? p : min, points[0]);

    return computeConvexHull(points, start, start);
}

// Compute Convex Hull using Gift Wrapping
export function computeConvexHull(
    points: Vector2d[],
    current: Vector2d,
    start: Vector2d,
    hull: Vector2d[] = []
): Vector2d[] {
    hull.push(current);

    const { next, nextPts } = findNextPoint(points, current);
    if (next === start) return hull; // 최초 점으로 돌아오면 종료

    return computeConvexHull(nextPts, next, start, hull);
}

// Get cross-product for CCW
export function getCrossProduct(p1: Vector2d, p2: Vector2d): number {
    return p1.x * p2.y - p1.y * p2.x;
}

export function getVector(p1: Vector2d, p2: Vector2d): Vector2d {
    return { x: p2.x - p1.x, y: p2.y - p1.y };
}

export function getSquaredDistance(p1: Vector2d, p2: Vector2d): number {
    return (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
}

// Find the next point in Gift Wrapping algorithm
export function findNextPoint(
    pts: Vector2d[],
    current: Vector2d
): { next: Vector2d; nextPts: Vector2d[] } {
    if (pts.length < 2) {
        throw new Error("At least two points are required.");
    }

    let ptNext = pts[0];
    const ptsDropped: Vector2d[] = [];

    for (const ptCompare of pts) {
        if (ptCompare === current) continue;

        const v1 = getVector(current, ptNext);
        const v2 = getVector(current, ptCompare);
        const cross = getCrossProduct(v1, v2);

        if (cross < 0) {
            ptNext = ptCompare;
            ptsDropped.length = 0; // 새 점이 선택되면 dropped 리스트 초기화
        } else if (cross === 0) {
            if (getSquaredDistance(current, ptCompare) > getSquaredDistance(current, ptNext)) {
                ptsDropped.push(ptNext); // 기존 점을 dropped에 추가
                ptNext = ptCompare;
            } else {
                ptsDropped.push(ptCompare); // 새로운 점을 dropped에 추가
            }
        }
    }

    // nextPts에서 ptNext만 제거하고 나머지는 유지 (불필요한 점 제거 방지)
    let nextPts = pts.filter(pt => pt !== ptNext);

    // nextPts가 비어버리는 것을 방지하기 위해 최소한 1개는 유지
    if (nextPts.length === 0) {
        nextPts = [ptNext]; // 마지막 남은 점이라도 유지
    }

    return { next: ptNext, nextPts };
}