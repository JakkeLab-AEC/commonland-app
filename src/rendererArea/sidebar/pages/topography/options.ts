import { BoundaryMetadata } from "@/dto/serviceModel/boundaryDto"
import { TopoType } from "@/mainArea/models/topoType"
import { Vector3d } from "@/mainArea/types/vector"

export type TopoCreationOptions = {
    name: string,
    isBatched: boolean,
    topoType: TopoType,
    colorIndex: number,
    basePoints: Vector3d[],
    offset: number,
    boundary?: BoundaryMetadata,
    resolution?: number,
}