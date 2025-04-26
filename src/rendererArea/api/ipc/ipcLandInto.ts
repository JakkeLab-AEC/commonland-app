import { LandInfoDto } from "@/dto/serviceModel/landInfo";
import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";

export interface IElectronIPCLandInfo {
    fetchLandInfo(): Promise<{result: boolean, message?: string, landInfo?: LandInfoDto}>;
    updateLandInfo(option: LandInfoModifyOption): Promise<{result: boolean, message?: string}>;
    registerLandInfo(info: LandInfoDto): Promise<{result: boolean, message?: string}>;
}

declare global {
    interface Window {
        electronLandInfoAPI: IElectronIPCLandInfo;
    }
}