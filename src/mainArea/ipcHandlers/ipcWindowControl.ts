import { BrowserWindow, IpcMain } from "electron";
import path from "path";

export const setIpcWindowControl = (ipcMain: IpcMain) => {
    ipcMain.handle('window-control-new-window', async(_) => {
        
        // Create the browser window.
        const window = new BrowserWindow({
            width: 300,
            height: 800,
            resizable: false,
            titleBarStyle: 'default',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
            alwaysOnTop: true,
        });
        
        // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        //     window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/rendererArea/screens/boringPreviewer/boringpreviewer.html`);
        // } else {
        //     window.loadFile(path.join(__dirname, `../renderer/boring_previewer/boringpreviewer.html`));
        // }
    });
}