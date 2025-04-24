import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from 'electron';
import { AppController } from './mainArea/appController/appController';
import path from 'path';
import os, { platform } from 'os';
import { setIpcWindowControl } from './mainArea/ipcHandlers/ipcWindowControl';
import { setIpcBoringRepository } from './mainArea/ipcHandlers/ipcBoringRepository';
import { setIpcProjectIOHandler } from './mainArea/ipcHandlers/ipcProjectFile';
import { setIpcTopoRepository } from './mainArea/ipcHandlers/ipcTopoRepository';
import { UIController } from './mainArea/appController/uicontroller/uicontroller';
import { setIpcModalControl } from './mainArea/ipcHandlers/ipcModalHandlers';
import { setIPCPythonPipe } from './mainArea/ipcHandlers/ipcPythonPipe';
import fs from 'fs';
import { setIpcSiteBoundary } from './mainArea/ipcHandlers/ipcBoundary';

if (require('electron-squirrel-startup')) app.quit();

let mainWindow: BrowserWindow | null;

const createMainWindow = () => {
  console.log(path.join(__dirname, 'preload.js'));
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 800,
    title: 'Commonland Desktop',
    titleBarStyle: os.platform() == 'win32'? 'hidden' : 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      devTools: !app.isPackaged,
    },
  });
  
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../.vite/index.html'));
  }

  // Send os info
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('os-info', {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      mode: app.isPackaged ? 'dist' : 'dev'
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Prevent refresh on dist environment
  if(app.isPackaged) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (
        input.key === 'F5' || 
        (input.control && input.key === 'r') || 
        (input.control && input.shift && input.key === 'R')
      ) {
        event.preventDefault();
      }
    });
  }

  // Menu template
  const submenus: MenuItemConstructorOptions[] = [
    {role: 'about'},
    {role: 'quit'},
  ];

  const menuOption: MenuItemConstructorOptions = {
    label: 'Edit',
    submenu: submenus
  };

  if(!app.isPackaged) {
    submenus.push({role: 'toggleDevTools'});
    submenus.push({role: 'reload'});
  }

  const template:MenuItemConstructorOptions[] = [menuOption];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  
  UIController.initiate();
  UIController.instance.registerWindow('main-window', mainWindow);
};

app.on('ready', () => {
  createMainWindow();

  const osInfo = os.platform();
  if(osInfo === 'win32' || osInfo === 'darwin') {
    const osCode = osInfo === 'win32' ? 'win' : 'mac';
    const pythonDirectory = path.resolve(__dirname, './pythonEnv');
    AppController.InitiateAppController(osCode, pythonDirectory, __dirname);

    setIpcWindowControl(ipcMain);

    setIpcBoringRepository(ipcMain);

    setIpcProjectIOHandler(ipcMain);

    setIpcTopoRepository(ipcMain);

    setIpcModalControl(ipcMain);

    setIPCPythonPipe(ipcMain);

    setIpcSiteBoundary(ipcMain);
    
  } else {
    
  }
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

app.on('quit', async () => {
  const responseDataPath = path.resolve(app.getPath('userData'), "responses");
  try {
    // responses 폴더 내부의 폴더만 삭제
    const files = await fs.promises.readdir(responseDataPath);
    
    for (const file of files) {
      const filePath = path.join(responseDataPath, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        await fs.promises.rm(filePath, { recursive: true, force: true });
      }
    }
    
    console.log("responses 폴더 내부의 모든 폴더가 삭제되었습니다.");
  } catch (error) {
    console.error("폴더 삭제 중 오류 발생:", error);
  }
});