import { Vector2d } from "@/mainArea/types/vector";
import { DTOBase } from "../DTOBase";

export interface BoundaryDTO extends DTOBase {
    threeObjId: string,
    name: string,
    colorIndex: number,
    pts: Vector2d[]
}

export interface BoundaryMetadata extends DTOBase {
    threeObjId: string,
    name: string,
    colorIndex: number
}