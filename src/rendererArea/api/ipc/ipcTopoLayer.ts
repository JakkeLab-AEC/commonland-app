import { TopoDTO } from "@/dto/serviceModel/topoDto";

export interface IElectronIPCTopoLayer {
    insertTopo(topoDto: TopoDTO): Promise<{result: boolean, message?: string}>;
    fetchAllTopos(): Promise<{result: boolean, message?: string, topoDatas?: TopoDTO[]}>;
    updateTopoColor(id:string, index: number) : Promise<{result: boolean, message?: string}>;
    removeTopos(ids: string[]): Promise<{result: boolean, message?: string}>;
}

declare global {
    interface Window {
        electronTopoLayerAPI: IElectronIPCTopoLayer;
    }
}