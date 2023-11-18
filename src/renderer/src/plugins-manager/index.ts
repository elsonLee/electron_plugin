import { PLUGIN_INSTALL_DIR  as baseDir } from '../../../common/constans/renderer'
import { PluginHandler } from '../../../core'

const createPluginManager = (): any => {
    const pluginInstance = new PluginHandler({
        baseDir,
    });

    const initPlugins = async () => {

    }

    return {
        initPlugins
    }
}

export default createPluginManager;