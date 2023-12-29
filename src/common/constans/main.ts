import { app } from 'electron';
import path from 'path';

/*
 * TODO: assign a dir under electron
 * Per-user application data directory
 * %APPDATA% on Windows
 * $XDG_CONFIG_HOME or ~/.config on Linux
 * ~/Library/Application Support on macOS
*/ 
const appPath = app.getPath('userData');
const PLUGIN_INSTALL_DIR = path.join(appPath, './plugins');

export { PLUGIN_INSTALL_DIR };