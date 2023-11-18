import {
    BrowserWindow,
    ipcMain,
    app,
} from "electron"
import { LocalDb } from "../../core";

const dbInstance = new LocalDb(app.getPath("userData"));
dbInstance.init();

export const API: any = {
    currentPlugin: null,
    DBKEY: "DB_DEFAULT",

    dbGet({ data }) {
        return dbInstance.get(API.DBKEY, data.id);
    },
};

export default (mainWindow: BrowserWindow) => {
  // 响应 preload.js 事件
  ipcMain.on("msg-trigger", async (event, arg) => {
    const window = arg.winId ? BrowserWindow.fromId(arg.winId) : mainWindow;
    const data = await API[arg.type](arg, window, event);
    event.returnValue = data;
    // event.sender.send(`msg-back-${arg.type}`, data);
  });
};