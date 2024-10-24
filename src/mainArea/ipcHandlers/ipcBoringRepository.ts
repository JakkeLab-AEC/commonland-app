import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { BoringDTO } from "../../dto/serviceModel/BoringDTO";

export const setIpcBoringRepository = (ipcMain: IpcMain) => {
    ipcMain.handle('boring-repository-insert', async (_, boringDto: BoringDTO) => {
        const insertJob = await AppController.getInstance().getRepository('Boring').insertBoring(boringDto);
        return insertJob;
    })

    ipcMain.handle('boring-repository-fetch-all', async(_) => {
        const fetchJob = await AppController.getInstance().getRepository('Boring').fetchAllBorings();
        return fetchJob;
    });
    
    ipcMain.handle('boring-repository-update', async (_, boringDto: BoringDTO) => {
        const updateJob = await AppController.getInstance().getRepository('Boring').updateBoring(boringDto);
        return updateJob;
    });

    ipcMain.handle('boring-repository-search-name-pattern', async(_, prefix: string, index:number) => {
        const searchNamesJob = await AppController
            .getInstance()
            .getRepository('Boring')
            .searchBoringNamePattern(prefix, index);
        return searchNamesJob;
    });

    ipcMain.handle('boring-repository-search-name-exact', async(_, name: string) => {
        const searchNamesJob = await AppController
            .getInstance()
            .getRepository('Boring')
            .searchBoringName(name);
        return searchNamesJob;
    });

    ipcMain.handle('boring-repository-remove', async(_, ids: string[]) => {
        const removeJob = await AppController.getInstance().getRepository('Boring').removeBoring(ids);
        return removeJob;
    });

    ipcMain.handle('boring-repository-update-batch', async(_, idAndOptions: {id: string, option: boolean}[]) => {
        const updateBatchJob = await AppController.getInstance().getRepository('Boring').updateBoringBatch(idAndOptions);
        return updateBatchJob;
    })

    ipcMain.handle('boring-repository-layer-colors-fetchall', async(_) => {
        const fetchAllLayerColorsJob = await AppController.getInstance().getRepository('Boring').getAllLayerColors();
        return fetchAllLayerColorsJob;
    });

    ipcMain.handle('boring-repository-layer-colors-update', async(_, layerName: string, colorIndex: number) => {
        const updateLayerColorJob = await AppController.getInstance().getRepository('Boring').updateLayerColor(layerName, colorIndex);
        return updateLayerColorJob;
    });
}