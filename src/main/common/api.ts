import {
    BrowserWindow,
    ipcMain,
    app,
} from "electron"
import { LocalDb } from "../../core";
import DBInstance from "./db";

//const dbInstance = new LocalDb(app.getPath("userData"));
//dbInstance.init();

//export const API: any = {
//    currentPlugin: null,
//    DBKEY: "DB_DEFAULT",
//
//    dbGet({ data }) {
//        return dbInstance.get(API.DBKEY, data.id);
//    },
//};
//
//export default (mainWindow: BrowserWindow) => {
//  // 响应 preload.js 事件
//  ipcMain.on("msg-trigger", async (event, arg) => {
//    const window = arg.winId ? BrowserWindow.fromId(arg.winId) : mainWindow;
//    const data = await API[arg.type](arg, window, event);
//    event.returnValue = data;
//    // event.sender.send(`msg-back-${arg.type}`, data);
//  });
//};

class API extends DBInstance {
  init (mainWindow: BrowserWindow)
  {
    ipcMain.on('msg-trigger', async (event, arg) => {
      const window = arg.winId ? BrowserWindow.fromId(arg.winId) : mainWindow;
      const data = await this[arg.type](arg, window, event);
      event.returnValue = data;
      // event.sender.send(`msg-back-${arg.type}`, data);
    });
    // 按 ESC 退出插件
    //mainWindow.webContents.on('before-input-event', (event, input) =>
    //  this.__EscapeKeyDown(event, input, mainWindow)
    //);
  }
}

export default new API();