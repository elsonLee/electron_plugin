import path from 'path';

const app = require('@electron/remote').app;
const appPath = app.getPath('userData');

const PLUGIN_INSTALL_DIR = path.join(appPath, './plugins');

export { PLUGIN_INSTALL_DIR };