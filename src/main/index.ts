import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
//import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import '../common/utils/localPlugins';

import API from "./common/api";
import localConfig from './common/initLocalConfig';
import registerSystemPlugin from './common/registerSystemPlugin';

require('@electron/remote/main').initialize();

global.testVar = 1234;

//function createWindow(): void {
//  // Create the browser window.
//  const mainWindow = new BrowserWindow({
//    width: 900,
//    height: 670,
//    show: false,
//    autoHideMenuBar: true,
//    ...(process.platform === 'linux' ? { icon } : {}),
//    webPreferences: {
//      preload: join(__dirname, '../preload/index.js'),
//      sandbox: false
//    }
//  })
//
//  mainWindow.on('ready-to-show', () => {
//    mainWindow.show()
//  })
//
//  mainWindow.webContents.setWindowOpenHandler((details) => {
//    shell.openExternal(details.url)
//    return { action: 'deny' }
//  })
//
//  // HMR for renderer base on electron-vite cli.
//  // Load the remote URL for development or the local html file for production.
//  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//  } else {
//    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//  }
//}
//
//// This method will be called when Electron has finished
//// initialization and is ready to create browser windows.
//// Some APIs can only be used after this event occurs.
//app.whenReady().then(() => {
//  // Set app user model id for windows
//  electronApp.setAppUserModelId('com.electron')
//
//  // Default open or close DevTools by F12 in development
//  // and ignore CommandOrControl + R in production.
//  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
//  app.on('browser-window-created', (_, window) => {
//    optimizer.watchWindowShortcuts(window)
//  })
//
//  createWindow()
//
//  app.on('activate', function () {
//    // On macOS it's common to re-create a window in the app when the
//    // dock icon is clicked and there are no other windows open.
//    if (BrowserWindow.getAllWindows().length === 0) createWindow()
//  })
//})
//
//// Quit when all windows are closed, except on macOS. There, it's common
//// for applications and their menu bar to stay active until the user quits
//// explicitly with Cmd + Q.
//app.on('window-all-closed', () => {
//  if (process.platform !== 'darwin') {
//    app.quit()
//  }
//})
//
//// In this file you can include the rest of your app"s specific main process
//// code. You can also put them in separate files and require them here.

const WinCreator = () => {
  let win: any;

  const init = () => {
    createBrowerWindow();
    require('@electron/remote/main').enable(win.webContents);
//  app.on('activate', function () {
//    // On macOS it's common to re-create a window in the app when the
//    // dock icon is clicked and there are no other windows open.
//    if (BrowserWindow.getAllWindows().length === 0) createWindow()
//  })
  }

  const createBrowerWindow = async () => {
    // Create the browser window.
    win = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        //
        contextIsolation: false,
        nodeIntegration: true,
      }
    });

    win.on('ready-to-show', () => {
     win.show()
    });

    win.on('closed', () => {
      win = undefined
    });

    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
      win.webContents.openDevTools({ mode:'bottom'});
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }
  };

  const getWindow = () => win;

  return {
    init,
    getWindow
  };
}

class App {

  public windowCreator: { init: () => void; getWindow: () => BrowserWindow };
  private systemPlugins: any;

  constructor() {
    this.windowCreator = WinCreator()
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
    } else {
      this.systemPlugins = registerSystemPlugin();
      this.onReady();
      this.onRunning();
      this.onQuit();
    }
  }

  createWindow() {
    this.windowCreator.init();
  }

  onReady() {
    console.log('onReady called');

    const readyFunction = async () => {
      console.log('readyFunction called');

      // init localConfig & global
      await localConfig.init();

      console.log('global.version: ', global.version);

      this.createWindow();
      // register ipcMain.on
      API.init(this.windowCreator.getWindow());
    };

    if (!app.isReady()) {
      app.on('ready', readyFunction)
    } else {
      readyFunction();
    }
  }

  onRunning() {
    app.on('activate', () => {
        if (!this.windowCreator.getWindow()) {
            this.createWindow();
        }
    })
    //app.on('activate', () => {
    //  // On macOS it's common to re-create a window in the app when the
    //  // dock icon is clicked and there are no other windows open.
    //  if (BrowserWindow.getAllWindows().length === 0) createWindow()
    //})
  }

  onQuit() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }      
    })
  }
}

export default new App();