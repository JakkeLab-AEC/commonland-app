export type ZPoints = {
    z: number,
    i: number,
    j: number
}

export type KrigingResult = {
    points: ZPoints[],
    max_i: number,
    max_j: number,
    resolution: number
}