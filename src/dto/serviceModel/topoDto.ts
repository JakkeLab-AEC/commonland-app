import { ModelType } from "@/mainArea/models/modelType";
import { DTOBase } from "../DTOBase";
import { TopoType } from "@/mainArea/models/topoType";
import { TriangleIndexSet } from "@/mainArea/types/triangleDataSet";

export interface TopoDTO extends DTOBase {
    id: string,
    modelType: ModelType,
    topoType: TopoType,
    name: string,
    points: {
        id?: string,
        index?: number,
        x: number,
        y: number,
        z: number
    }[],
    threeObjId: string,
    colorIndex: number,
    isBatched: 0 | 1,
    resolution: number;
    triangles?: TriangleIndexSet[],
}