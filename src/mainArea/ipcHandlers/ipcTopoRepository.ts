import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { OBBDto } from "../models/graphics/obb";
import { TopoType } from "../models/topoType";
import { Vector3d } from "../types/vector";

export const setIpcTopoRepository = (ipcMain: IpcMain) => {
    ipcMain.handle('topolayer-insert', async (_, topoDto:TopoDTO, obb?: OBBDto) => {
        let insertJob: {
            result: boolean;
            message?: string;
        };

        if(topoDto.topoType === TopoType.DelaunayMesh) {
            insertJob = await AppController.getInstance().getTopoRepository().insertTopo(topoDto);
        } else {
            const pts:Vector3d[] = topoDto.points.map(pt => {
                return {
                    x: pt.x,
                    y: pt.y,
                    z: pt.z
                }
            });

            await AppController.getInstance().pythonBridge.send({
                action: "CalculateTopo",
                args: {
                    obb: {
                        pts: obb.pts
                    },
                    points: pts,
                    resolution: topoDto.resolution
                }
            });
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