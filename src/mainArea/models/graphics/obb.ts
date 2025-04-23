import { Vector2d } from "@/mainArea/types/vector";
import { getConvexHull } from "@/mainArea/utils/geometrics/convexHullUtils";
import { getOBB } from "@/mainArea/utils/geometrics/obbUtils";

export interface OBBDto {
    pts: {p0: Vector2d, p1: Vector2d, p2: Vector2d, p3: Vector2d};
}


export class OBB {
    private points: Vector2d[];
    private obbPts: {p0: Vector2d, p1: Vector2d, p2: Vector2d, p3: Vector2d};

    constructor(points: Vector2d[] = []) {
        this.points = points;
        this.refresh();
    }

    private refresh() {
        const hull = getConvexHull(this.points);
        this.obbPts = getOBB(hull);
    }

    addPoints(points: Vector2d[]) {
        this.points.push(...points);
        this.refresh();
    }

    removePoint(point: Vector2d): void;
    removePoint(index: number): void;

    removePoint(pointOrIndex?: Vector2d | number): void {
        if (typeof pointOrIndex === 'number') {
            this.points.splice(pointOrIndex, 1);
        } else if (pointOrIndex) {
            this.points = this.points.filter(p => p !== pointOrIndex);
        } else {
            this.points.pop();
        }

        // Re-compute OBB
        this.refresh();
    }

    getContainedPoints() {
        return this.points;
    }

    serialize():OBBDto {
        return {
            pts: this.obbPts
        }
    }
}