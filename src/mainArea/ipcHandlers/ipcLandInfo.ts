import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { LandInfoModifyOption } from "../repository/landInfoRepository";
import { LandInfoDto } from "@/dto/serviceModel/landInfo";

export const setIpcLandInfo = (ipcMain: IpcMain) => {
    ipcMain.handle('landinfo-fetch', async (_) => {
        return await AppController.getInstance().repositories.landInfo.fetchInfo();
    });

    ipcMain.handle('landinfo-update', async(_, option: LandInfoModifyOption) => {
        return await AppController.getInstance().repositories.landInfo.modifyInfo(option);
    });

    ipcMain.handle('landinfo-register', async(_, info: LandInfoDto) => {
        return await AppController.getInstance().repositories.landInfo.registerInfo(info, info.landId);
    });
}