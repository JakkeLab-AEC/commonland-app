import { IpcMain } from "electron"
import { AppController } from "../appController/appController";

export const setIPCPythonPipe = (ipcMain: IpcMain) => {
    ipcMain.handle('test-python-pipe', (_) => {
        AppController.getInstance().pythonBridge.test();
    });
}