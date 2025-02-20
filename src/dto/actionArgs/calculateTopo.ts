export interface CalculateTopoArgs {
    obb: {
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
    },
    points: {x: number, y: number, z: number}[],
    resolution: number
}