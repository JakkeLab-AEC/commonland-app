import { ModelType } from "@/mainArea/models/modelType";
import { DTOBase } from "../DTOBase";
import { TopoType } from "@/mainArea/models/topoType";
import { TriangleSet } from "@/mainArea/types/triangleDataSet";
import { BoringDepth } from "./boringDepth";

export interface TopoDTO extends DTOBase {
    // Id data
    topoType: TopoType,
    name: string,
    threeObjId: string,
    colorIndex: number,
    isBatched: 0 | 1,
    resolution?: number;

    // Geometric datas
    triangles?: TriangleSet,
    points: {
        id?: string,
        index?: number,
        x: number,
        y: number,
        z: number
    }[],

    // Base Data
    baseBorings?: BoringDepth[],
}

export interface TopoMetadataDTO extends DTOBase {
    topoType: TopoType,
    name: string,
    threeObjId: string,
    colorIndex: number,
    isBatched: 0 | 1,
    resolution?: number;
    baseBorings?: BoringDepth[],
}