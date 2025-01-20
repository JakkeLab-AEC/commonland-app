import { dialog, IpcMain } from "electron";
import { UIController } from "../appController/uicontroller/uicontroller";

export const setIpcModalControl = (ipcMain: IpcMain) => {
    ipcMain.handle('call-dialog-error', async (_, title, message) => {
        await dialog.showMessageBox(UIController.instance.getWindow('main-window'), {
            type: "error",
            title: title,
            message: message,
            buttons: ["OK"],
        });
    });
}