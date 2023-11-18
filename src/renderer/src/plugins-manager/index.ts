import { PLUGIN_INSTALL_DIR as baseDir } from '../../../common/constans/renderer'
import { PluginHandler } from '../../../core'
import log from 'electron-log/renderer'

const createPluginManager = (): any => {
    //const pluginInstance = new PluginHandler({
    //    baseDir,
    //});

    const initPlugins = async () => {
        console.log("baseDir" + baseDir.toString());
    };

    return {
        initPlugins,
    };
};

export default createPluginManager;