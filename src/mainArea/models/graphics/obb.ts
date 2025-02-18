import { Vector2d, Vector3d } from "@/mainArea/types/vector";

type OBBProps = {
    domainX: number,
    domainY: number,
    centroid: {
        x: number,
        y: number,
        z: number,
    },
    xAxis: {
        x: number,
        y: number
    }
}


export class OBB {
    private domainX: number;
    private domainY: number;
    private centroid: Vector3d;
    private xAxis: Vector2d;
    private points: Vector3d[];

    constructor(points: Vector3d[] = []) {
        this.points = points;
    }

    private computeOBB() {

    }

    //#region CONVEX_HULL
    private computeConvexHull(points: Vector3d[], hull: Vector3d[]): Vector3d[] {
        if (hull.length === 0) {
            // Get first point (p0)
            const sortedPts = [...this.points].sort((a, b) => a.x - b.x);
            const p0 = sortedPts[0];
            hull.push(p0);
            return this.computeConvexHull(points.filter(p => p !== p0), hull);
        }

        // p1, p2, ..., pn
        const prev = hull. length > 1 ? hull[hull.length - 2] : hull[0];
        const curr = hull[hull.length - 1];

        const next = this.findNextPoint(points, curr, prev);
        if (next === hull[0]) {
            return hull;
        }

        hull.push(next);
        return this.computeConvexHull(points.filter (p => p !== next), hull);
    }

    private getCrossProduct(p1:Vector2d, p2:Vector2d) {
        return p2.x * p1.y - p1.x* p2.y;
    }

    private getCCW(p0: Vector2d, p1: Vector2d, p2: Vector2d) {
        const cross = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
        return cross;
    }

    private angleBetweenVectors(p0:Vector2d, p1:Vector2d, p2:Vector2d) {
        const v1:Vector2d = {
            x: p1.x - p0.x,
            y: p1.x - p0.y
        };

        const v2:Vector2d = {
            x: p2.x - p1.x,
            y: p2.x - p1.y
        };

        const cross = this.getCrossProduct(p0, p1);
        
        const v1Magnitude = Math.hypot(v1.x, v1.y);
        const v2Magnitude = Math.hypot(v2.x, v2.y);

        if (v1Magnitude === 0 || v2Magnitude === 0) return 0;

        const sinTheta = cross / (v1Magnitude * v2Magnitude);
        return Math.asin(sinTheta);
    }

    private findNextPoint(pts: Vector3d[], current: Vector3d, previous: Vector3d) {
        let next = pts[0];

        for(let i = 0; i < pts.length; i++) {
            const cross = this.getCCW(previous, current, pts[i]);

            if (cross > 0 || (cross === 0 && this.angleBetweenVectors(previous, current, pts[i]) > this.angleBetweenVectors(previous, current, next))) {
                next = pts[i];
            }
        }

        return next;
    }

    //#endregion

    addPoint() {
        // 
        
        // Re-compute OBB
        this.computeOBB();
    }

    
    removePoint(point: Vector3d): void;
    removePoint(index: number): void;

    removePoint(pointOrIndex?: Vector3d | number): void {
        if (typeof pointOrIndex === 'number') {
            this.points.splice(pointOrIndex, 1);
        } else if (pointOrIndex) {
            this.points = this.points.filter(p => p !== pointOrIndex);
        } else {
            this.points.pop();
        }

        // Re-compute OBB
        this.computeOBB();
    }

    getContainedPoints() {
        return this.points;
    }

    serialize():OBBProps {
        return {
            domainX: this.domainX,
            domainY: this.domainY,
            centroid: this.centroid,
            xAxis: this.xAxis,
        }
    }
}