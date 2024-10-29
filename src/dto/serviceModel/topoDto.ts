import { ModelType } from "@/mainArea/models/modelType";
import { DTOBase } from "../DTOBase";

export interface TopoDTO extends DTOBase {
    id: string,
    modelType: ModelType,
    name: string,
    points: {
        id: string,
        x: number,
        y: number,
        z: number
    }[],
    colorIndex: number,
    isBatched: 0 | 1,
}