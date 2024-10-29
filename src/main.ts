import { app, BrowserWindow, ipcMain } from 'electron';
import { AppController } from './mainArea/appController/appController';
import path from 'path';
import { setIpcWindowControl } from './mainArea/ipcHandlers/ipcWindowControl';
import { setIpcBoringRepository } from './mainArea/ipcHandlers/ipcBoringRepository';
import { setIpcProjectIOHandler } from './mainArea/ipcHandlers/ipcProjectFile';
import { setIpcTopoRepository } from './mainArea/ipcHandlers/ipcTopoRepository';

if (require('electron-squirrel-startup')) app.quit();

let mainWindow: BrowserWindow | null;

const createMainWindow = () => {
  console.log(path.join(__dirname, 'preload.js'));
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 800,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // preload 스크립트 설정
      contextIsolation: true,
      nodeIntegration: true,
    },
  });
  
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../.vite/index.html'));
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  createMainWindow();

  AppController.InitiateAppController();

  setIpcWindowControl(ipcMain);

  setIpcBoringRepository(ipcMain);

  setIpcProjectIOHandler(ipcMain);

  setIpcTopoRepository(ipcMain);

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});