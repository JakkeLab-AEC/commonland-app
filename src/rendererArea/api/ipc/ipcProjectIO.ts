import { LandInfoDTO } from "@/dto/serviceModel/landInfo";

export interface IElectronIPCBoringData {
    saveProject: () => Promise<{result: boolean, message?: string}>,
    openProject: () => Promise<{result: boolean, message?: string, landInfo?: LandInfoDTO}>,
    newProject: () => Promise<{result: boolean, message?: string, landInfo?: LandInfoDTO}>,
}

declare global {
    interface Window {
        electronProjectIOAPI: IElectronIPCBoringData;
    }
}