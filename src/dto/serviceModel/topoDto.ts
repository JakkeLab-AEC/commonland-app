import { ModelType } from "@/mainArea/models/modelType";
import { DTOBase } from "../DTOBase";
import { TopoType } from "@/mainArea/models/topoType";

export interface TopoDTO extends DTOBase {
    id: string,
    modelType: ModelType,
    topoType: TopoType,
    name: string,
    points: {
        id: string,
        x: number,
        y: number,
        z: number
    }[],
    threeObjId: string,
    colorIndex: number,
    isBatched: 0 | 1,
}