import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { OBBDto } from "../models/graphics/obb";
import { TopoType } from "../models/topoType";
import { TopoUtils } from "../utils/wrapper";

export const setIpcTopoRepository = (ipcMain: IpcMain) => {
    ipcMain.handle('topolayer-insert', async (_, topoDto:TopoDTO, obb?: OBBDto) => {
        let insertJob: {
            result: boolean;
            message?: string;
        };

        if(topoDto.topoType === TopoType.DelaunayMesh) {
            insertJob = await AppController.getInstance().repositories.topo.insertTopo(topoDto);
        } else {
            console.log(topoDto);
            const krigingResult = await TopoUtils.createTopoDataSet.runPykrige(obb, topoDto.resolution, topoDto.points);
            if(!krigingResult.result) return {result: false, message: krigingResult.message};

            insertJob = await AppController.getInstance().repositories.topo.insertTopoKrigged(topoDto, krigingResult.topoDataSet);
        }
        
        return insertJob;
    });

    ipcMain.handle('topolayer-fetch-all', async (_) => {
        const fetchJob = await AppController.getInstance().repositories.topo.fetchAllTopos();
        return fetchJob;
    });

    ipcMain.handle('topolayer-fetch-metadata-all', async (_) => {
        const fetchJob = await AppController.getInstance().repositories.topo.fetchAllTopoMetadatas();
        return fetchJob;
    });

    ipcMain.handle('topolayer-update-color', async (_, id:string, index: number) => {
        const updateJob = await AppController.getInstance().repositories.topo.updateTopoColor(id, index);
        return updateJob;
    });

    ipcMain.handle('topolayer-remove', async (_, ids: string[]) => {
        const insertJob = await AppController.getInstance().repositories.topo.removeTopos(ids);
        return insertJob;
    });

    ipcMain.handle('topolayer-update-threeobjid', async (_, ids: {id: string, threeObjId: string}[]) => {
        const updateJob = await AppController.getInstance().repositories.topo.updateThreeObjId(ids);
        return updateJob;
    });
}