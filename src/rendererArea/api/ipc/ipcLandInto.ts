import { LandInfoDTO } from "@/dto/serviceModel/landInfo";
import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";

export interface IElectronIPCLandInfo {
    fetchLandInfo(): Promise<{result: boolean, message?: string, landInfo?: LandInfoDTO}>;
    updateLandInfo(option: LandInfoModifyOption): Promise<{result: boolean, message?: string}>;
    registerLandInfo(info: LandInfoDTO): Promise<{result: boolean, message?: string}>;
}

declare global {
    interface Window {
        electronLandInfoAPI: IElectronIPCLandInfo;
    }
}