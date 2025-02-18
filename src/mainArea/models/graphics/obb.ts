import { Vector2d, Vector3d } from "@/mainArea/types/vector";
import { computeConvexHull } from "@/mainArea/utils/convexHullUtils";

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
        // computeConvexHull(this.points, )
    }

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