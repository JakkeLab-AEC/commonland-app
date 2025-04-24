import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { OBBDto } from "../models/graphics/obb";
import { TopoType } from "../models/topoType";
import { Vector3d } from "../types/vector";
import fs from 'fs';
import { PredictedPoint } from "../types/predictedPoint";
import { PointHash, TriangleHash, TriangleSet } from "../types/triangleDataSet";
import { TopoUtils } from "../utils/wrapper";

export const setIpcTopoRepository = (ipcMain: IpcMain) => {
    ipcMain.handle('topolayer-insert', async (_, topoDto:TopoDTO, obb?: OBBDto) => {
        let insertJob: {
            result: boolean;
            message?: string;
        };

        if(topoDto.topoType === TopoType.DelaunayMesh) {
            insertJob = await AppController.getInstance().getTopoRepository().insertTopo(topoDto);
        } else {
            const krigingResult = await TopoUtils.createTopoDataSet.runPykrige(obb, topoDto.resolution, topoDto.points);
            if(!krigingResult.result) return {result: false, message: krigingResult.message};
            
            insertJob = await AppController.getInstance().getTopoRepository().insertTopoKrigged(topoDto, krigingResult.topoDataSet);
        }
        
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