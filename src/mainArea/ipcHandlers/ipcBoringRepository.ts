import { IpcMain } from "electron";
import { AppController } from "../appController/appController";
import { BoringDTO } from "../../dto/serviceModel/BoringDTO";

export const setIpcBoringRepository = (ipcMain: IpcMain) => {
    ipcMain.handle('boring-repository-insert', async (_, boringDto: BoringDTO) => {
        const insertJob = await AppController.getInstance().repositories.boring.insertBoring(boringDto);
        return insertJob;
    })

    ipcMain.handle('boring-repository-fetch-all', async(_) => {
        const fetchJob = await AppController.getInstance().repositories.boring.fetchAllBorings();
        return fetchJob;
    });
    
    ipcMain.handle('boring-repository-update', async (_, boringDto: BoringDTO) => {
        const updateJob = await AppController.getInstance().repositories.boring.updateBoring(boringDto);
        return updateJob;
    });

    ipcMain.handle('boring-repository-update-multiple', async (_, boringDtos: BoringDTO[]) => {
        const updateJob = await AppController.getInstance().repositories.boring.updateBoringMultiple(boringDtos);
        return updateJob;
    });

    ipcMain.handle('boring-repository-search-name-pattern', async(_, prefix: string, index:number) => {
        const searchNamesJob = await AppController
            .getInstance()
            .repositories.boring
            .searchBoringNamePattern(prefix, index);
        return searchNamesJob;
    });

    ipcMain.handle('boring-repository-search-name-exact', async(_, name: string, id?: string) => {
        const searchNamesJob = await AppController
            .getInstance()
            .repositories.boring
            .searchBoringName(name, id);
        return searchNamesJob;
    });

    ipcMain.handle('boring-repository-remove', async(_, ids: string[]) => {
        const removeJob = await AppController.getInstance().repositories.boring.removeBoring(ids);
        return removeJob;
    });

    ipcMain.handle('boring-repository-update-batch', async(_, idAndOptions: {id: string, option: boolean}[]) => {
        const updateBatchJob = await AppController.getInstance().repositories.boring.updateBoringBatch(idAndOptions);
        return updateBatchJob;
    })

    ipcMain.handle('boring-repository-layer-colors-fetchall', async(_) => {
        const fetchAllLayerColorsJob = await AppController.getInstance().repositories.boring.getAllLayerColors();
        return fetchAllLayerColorsJob;
    });

    ipcMain.handle('boring-repository-layer-colors-update', async(_, layerName: string, colorIndex: number) => {
        const updateLayerColorJob = await AppController.getInstance().repositories.boring.updateLayerColor(layerName, colorIndex);
        return updateLayerColorJob;
    });
}