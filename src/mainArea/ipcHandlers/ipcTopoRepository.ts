import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { OBBDto } from "../models/graphics/obb";
import { TopoType } from "../models/topoType";
import { Vector3d } from "../types/vector";
import fs from 'fs';
import { PredictedPoint } from "../types/predictedPoint";
import { PointHash, TriangleHash, TriangleSet } from "../types/triangleDataSet";

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

            const response = await AppController.getInstance().pythonBridge.send({
                action: "CalculateTopo",
                args: {
                    obb: {
                        pts: obb.pts
                    },
                    points: pts,
                    resolution: topoDto.resolution
                }
            });

            if(!response || !response.result) 
                return {result: false, message: "Result not found from python."}

            const jobResult = response.jobResult;
            const pointPath = jobResult.pointFilePath;

            const pointFile = await fs.promises.readFile(pointPath, 'utf-8');
            const pointDatas:PredictedPoint[] = JSON.parse(pointFile);
            
            let indexMaxI = 0;
            let indexMaxJ = 0;
            const pointMap: PointHash[] = [];
            pointDatas.forEach(data => {
                const hash = `${data.i}_${data.j}`;

                indexMaxI = Math.max(indexMaxI, data.i);
                indexMaxJ = Math.max(indexMaxJ, data.j);

                const point: Vector3d = {x: data.x, y: data.y, z: data.z};
                pointMap.push({hash: hash, pt: point})
            });

            const triangles: TriangleHash[] = [];
            for(let i = 0; i < indexMaxI; i++) {
                for(let j = 0; j < indexMaxJ; j++) {
                    // Set hashes
                    const triangle0 = {
                        hashPt0: `${i}_${j}`,
                        hashPt1: `${i+1}_${j}`,
                        hashPt2: `${i}_${j+1}`,
                    }

                    const triangle1 = {
                        hashPt0: `${i+1}_${j}`,
                        hashPt1: `${i}_${j+1}`,
                        hashPt2: `${i+1}_${j+1}`,
                    }

                    triangles.push(triangle0, triangle1);
                }
            }

            const triangleSet: TriangleSet = {
                pts: pointMap,
                triangles: triangles
            }

            return {result: true, topoDataSet: triangleSet}
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