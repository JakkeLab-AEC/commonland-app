import { Vector2d } from "@/mainArea/types/vector";
import { getConvexHull } from "@/mainArea/utils/convexHullUtils";
import { computeOBB } from "@/mainArea/utils/obbUtils";

export interface OBBDto {
    domainX: number,
    domainY: number,
    centroid: Vector2d,
    xAxis: Vector2d,
}


export class OBB {
    private domainX: number;
    private domainY: number;
    private centroid: Vector2d;
    private angleDegree: number;
    private points: Vector2d[];

    constructor(points: Vector2d[] = []) {
        this.points = points;
        this.computeOBB();
    }

    private computeOBB() {
        const hull = getConvexHull(this.points);
        const {center, size, angle} = computeOBB(hull);
        
        this.domainX = size.x;
        this.domainY = size.y;
        this.centroid = {x: center.x, y: center.y};
        this.angleDegree = angle;
    }

    addPoint(point: Vector2d) {
        // Add point
        this.points.push(point);
        
        // Re-compute OBB
        this.computeOBB();
    }

    addPoints(points: Vector2d[]) {
        this.points.push(...points);
        this.computeOBB();
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
        this.computeOBB();
    }

    getContainedPoints() {
        return this.points;
    }

    serialize():OBBDto {
        return {
            domainX: this.domainX,
            domainY: this.domainY,
            centroid: this.centroid,
            xAxis: {x: Math.cos(this.angleDegree), y: Math.sin(this.angleDegree)},
        }
    }
}