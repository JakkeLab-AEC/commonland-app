import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { OBBDto } from "@/mainArea/models/graphics/obb";

export interface IElectronIPCTopoLayer {
    insertTopo(topoDto: TopoDTO, obb?: OBBDto): Promise<{result: boolean, message?: string}>;
    fetchAllTopos(): Promise<{result: boolean, message?: string, topoDatas?: TopoDTO[]}>;
    updateTopoColor(id:string, index: number): Promise<{result: boolean, message?: string}>;
    updateTopoThreeObjId(ids:{id: string, threeObjId: string}[]): Promise<{result: boolean, message?: string}>;
    removeTopos(ids: string[]): Promise<{result: boolean, message?: string}>;
}

declare global {
    interface Window {
        electronTopoLayerAPI: IElectronIPCTopoLayer;
    }
}