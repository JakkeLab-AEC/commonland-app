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
    private centroid: {x: number, y: number, z: number};
    private xAxis: {x: number, y: number};
    private points: {x: number, y: number, z: number}[];

    constructor(points: {x: number, y: number, z: number}[] = []) {
        this.points = points;
    }

    private computeOBB() {

    }

    private computeConvexHull() {
        
    }

    addPoint() {
        // 
        
        // Re-compute OBB
        this.computeOBB();
    }

    
    removePoint(point: {x: number, y: number, z: number}): void;
    removePoint(index: number): void;

    removePoint(pointOrIndex?: {x: number, y: number, z: number} | number): void {
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