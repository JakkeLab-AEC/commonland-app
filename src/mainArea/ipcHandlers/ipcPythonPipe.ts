import { IpcMain } from "electron"
import { AppController } from "../appController/appController";
import { PipeMessageSendRenderer } from "@/dto/pipeMessage";

export const setIPCPythonPipe = (ipcMain: IpcMain) => {
    ipcMain.handle('test-python-pipe', (_) => {
        AppController.getInstance().pythonBridge.test();
    });

    ipcMain.handle('start-python-loop', (_) => {
        AppController.getInstance().pythonBridge.start();
    });

    ipcMain.handle('send-message', async (_, message: PipeMessageSendRenderer) => {
        await AppController.getInstance().pythonBridge.send(message);
    });
}