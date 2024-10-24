import { IpcMain } from "electron";

export function setIPCElectronTestHandler(ipcMain: IpcMain) {
    ipcMain.handle('electron-test', async () => {
        const randomWords = [
            "apple",
            "mountain",
            "ocean",
            "river",
            "forest",
            "sky",
            "breeze",
            "cloud",
            "sunlight",
            "flower"
        ];

        const index = Math.trunc(Math.random()*10);

        return randomWords[index];
    })
}