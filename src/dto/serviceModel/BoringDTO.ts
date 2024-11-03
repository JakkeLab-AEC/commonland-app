import { DTOBase } from "../DTOBase";

export interface BoringDTO extends DTOBase {
    name: string;
    topoTop: number;
    undergroundWater: number,
    layers: {
        id: string,
        layerIndex: number,
        name: string,
        thickness: number,
    }[],
    location: {x: number, y: number},
    sptResults: {
        id: string,
        depth: number,
        hitCount: number,
        distance: number,
    }[],
    isBatched: 0 | 1,
    threeObjId: string,
}