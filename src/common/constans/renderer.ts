import remote from '@electron/remote'
import path from 'path';

const app = remote.require('app');
const appPath = app.getPath('cache');

const PLUGIN_INSTALL_DIR = path.join(appPath, './plugins');

export { PLUGIN_INSTALL_DIR };