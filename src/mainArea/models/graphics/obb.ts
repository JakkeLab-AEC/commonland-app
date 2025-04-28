import { Vector2d } from "@/mainArea/types/vector";
import { getConvexHull } from "@/mainArea/utils/geometrics/convexHullUtils";
import { getOBB } from "@/mainArea/utils/geometrics/obbUtils";
import * as JG from "jakke-graphics-ts";

export interface OBBDto {
    rotationX: number, 
    domainX: number,
    domainY: number,
    anchor: Vector2d,
    pts: Vector2d[],
}

export class OBB {
    private points: Vector2d[];
    private rotationX: number;
    private domainX: number;
    private domainY: number;
    private anchor: Vector2d;

    constructor(points: Vector2d[] = []) {
        this.points = points;
        this.refresh();
    }

    private refresh() {
        const hull = getConvexHull(this.points);
        const {p0, p1, p2, p3} = getOBB(hull);
        const xAxis: Vector2d = {x: p1.x - p0.x, y: p1.y - p0.y};
        const rotationX = Math.atan2(xAxis.y, xAxis.x);
        
        this.rotationX = rotationX;
        this.anchor = p0;
        this.domainX = JG.VectorUtils.getDist({...p0, z: 0}, {...p1, z: 0});
        this.domainY = JG.VectorUtils.getDist({...p0, z: 0}, {...p3, z: 0});
        this.points = [p0, p1, p2, p3];
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

    expandByOffset(offset: number) {
        const p0 = this.points[0];
        const p1 = this.points[1];
        const p3 = this.points[3];

        const p0p1NormNeg = JG.VectorUtils.chain({...p1, z: 0})
            .subtract({...p0, z: 0})
            .normalize()
            .scale(-offset)
            .value();
        const p0p3NormNeg = JG.VectorUtils.chain({...p3, z: 0})
            .subtract({...p0, z: 0})
            .normalize()
            .scale(-offset)
            .value();

        const offsetNegXNegY = JG.VectorUtils.add(p0p1NormNeg, p0p3NormNeg);

        const p0Offset = JG.VectorUtils.chain({...p0, z: 0}).add(offsetNegXNegY).value();
        
        this.anchor = p0Offset;
        this.domainX += offset * 2;
        this.domainY += offset * 2;
    }

    serialize():OBBDto {
        return {
            rotationX: this.rotationX,
            domainX: this.domainX,
            domainY: this.domainY,
            anchor: this.anchor,
            pts: this.points,
        }
    }
}