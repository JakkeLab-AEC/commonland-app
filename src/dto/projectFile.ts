import { BoringDTO } from "./serviceModel/BoringDTO";
import { BoundaryDTO } from "./serviceModel/boundaryDto";
import { LandInfoDTO } from "./serviceModel/landInfo";
import { LayerColor } from "./serviceModel/layerColor";

export interface ProjectFileDTO {
    landInfo: LandInfoDTO,
    borings: BoringDTO[],
    layerColors: LayerColor[],
    boundaries: BoundaryDTO[],
}