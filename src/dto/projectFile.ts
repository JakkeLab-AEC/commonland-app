import { BoringDTO } from "./serviceModel/BoringDTO";
import { BoundaryDTO } from "./serviceModel/boundaryDto";
import { LandInfoDTO } from "./serviceModel/landInfo";
import { LayerColor } from "./serviceModel/layerColor";
import { TopoDTO } from "./serviceModel/topoDto";

export interface ProjectFileDTO {
    landInfo: LandInfoDTO,
    borings: BoringDTO[],
    layerColors: LayerColor[],
    boundaries: BoundaryDTO[],
    topos: TopoDTO[]
}