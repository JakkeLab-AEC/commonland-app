import { Vector2d } from "@/mainArea/types/vector";

export interface BoundaryDto {
    id: string,
    threeObjId: string,
    name: string,
    pts: Vector2d[]
}