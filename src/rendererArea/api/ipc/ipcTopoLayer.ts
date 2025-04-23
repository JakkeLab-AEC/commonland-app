import { BoundaryDto } from "@/dto/serviceModel/boundaryDto";
import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { OBBDto } from "@/mainArea/models/graphics/obb";
import { TriangleSet } from "@/mainArea/types/triangleDataSet";

export interface IElectronIPCTopoLayer {
    insertTopo(topoDto: TopoDTO, obb?: OBBDto): Promise<{result: boolean, message?: string, topoDataSet?: TriangleSet}>;
    fetchAllTopos(): Promise<{result: boolean, message?: string, topoDatas?: TopoDTO[]}>;
    updateTopoColor(id:string, index: number): Promise<{result: boolean, message?: string}>;
    updateTopoThreeObjId(ids:{id: string, threeObjId: string}[]): Promise<{result: boolean, message?: string}>;
    removeTopos(ids: string[]): Promise<{result: boolean, message?: string}>;
    insertBoundary(name: string): Promise<{result: boolean, message?: string, boundary?: BoundaryDto}>;
}

declare global {
    interface Window {
        electronTopoLayerAPI: IElectronIPCTopoLayer;
    }
}