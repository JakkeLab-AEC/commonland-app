import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { TopoDTO } from "@/dto/serviceModel/topoDto";

export const setIpcTopoRepository = (ipcMain: IpcMain) => {
    ipcMain.handle('topolayer-insert', async (_, topoDto:TopoDTO) => {
        const insertJob = await AppController.getInstance().getTopoRepository().insertTopo(topoDto);
        return insertJob;
    });

    ipcMain.handle('topolayer-fetch-all', async (_) => {
        const fetchJob = await AppController.getInstance().getTopoRepository().fetchAllTopos();
        return fetchJob;
    });

    ipcMain.handle('topolayer-update-color', async (_, id:string, index: number) => {
        const updateJob = await AppController.getInstance().getTopoRepository().updateTopoColor(id, index);
        return updateJob;
    });

    ipcMain.handle('topolayer-remove', async (_, ids: string[]) => {
        const insertJob = await AppController.getInstance().getTopoRepository().removeTopos(ids);
        return insertJob;
    });

    ipcMain.handle('topolayer-update-threeobjid', async (_, ids: {id: string, threeObjId: string}[]) => {
        const updateJob = await AppController.getInstance().getTopoRepository().updateThreeObjId(ids);
        return updateJob;
    });
    
}