import { app, dialog, FileFilter, IpcMain } from "electron";
import { parsePolylinePoints } from "../utils/fileParsers/csvPolylineParser";
import { SystemUtils } from "../utils/wrapper";
import { AppController } from "../appController/appController";
import { BoundaryDto } from "@/dto/serviceModel/boundaryDto";
import { ElementId } from "../models/id";
import { ModelType } from "../models/modelType";


const POLYLNE_DIALOG_TITLE = 'Polyline 데이터 불러오기';
export const setIpcSiteBoundary = (ipcMain: IpcMain) => {
    ipcMain.handle('boundary-add', async (_, name: string) => {
        const filters: FileFilter[] = [];
        filters.push({
            name: 'CSV file',
            extensions: ['csv'],
        });

        const openFileJobResult = await SystemUtils.Modal.showFileOpenDialog(POLYLNE_DIALOG_TITLE, app.getPath('desktop'), filters);
        if(!openFileJobResult.result) return openFileJobResult;

        const parseJob = await parsePolylinePoints(openFileJobResult.filePaths[0]);
        const data: BoundaryDto = {
            id: new ElementId().getValue(),
            threeObjId: new ElementId().getValue(),
            name: name,
            pts: parseJob.parsedPts,
            colorIndex: 1,
            modelType: ModelType.Boundary
        }

        return await AppController.getInstance().getBoundaryRepository().insertBoundaries(data);
    });

    ipcMain.handle('boundary-remove', async (_, ids: string[]) => {
        return await AppController.getInstance().getBoundaryRepository().deleteBoundaries(ids);
    });

    ipcMain.handle('boundary-fetch-all', async(_) => {
        return await AppController.getInstance().getBoundaryRepository().selectAllBoundaries();
    });

    ipcMain.handle('boundary-fetch-by-id', async(_, id: string) => {
        return await AppController.getInstance().getBoundaryRepository().selectBoundary(id);
    });

    ipcMain.handle('boundary-fetch-metadata-by-id', async(_, id: string) => {
        return await AppController.getInstance().getBoundaryRepository().selectBoundaryMetadata(id);
    });

    ipcMain.handle('boundary-fetch-metadata-all', async(_, id: string) => {
        return await AppController.getInstance().getBoundaryRepository().selectAllBoundaryMetadata();
    });
}
