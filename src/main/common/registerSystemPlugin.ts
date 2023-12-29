import path from 'path';
import fs from 'fs';
import { PLUGIN_INSTALL_DIR } from '../../common/constans/main';

export default () => {
    console.log('registerSystemPlugin: ', global.LOCAL_PLUGINS);

    // 读取所有插件
    const totalPlugins = global.LOCAL_PLUGINS.getLocalPlugins();
    console.log('totalPlugins: ', totalPlugins);
    let systemPlugins = totalPlugins.filter(
        (plugin) => plugin.pluginType === 'system'
    );
    systemPlugins = systemPlugins
        .map((plugin) => {
            try {
                const pluginPath = path.resolve(
                    PLUGIN_INSTALL_DIR,
                    'node_modules',
                    plugin.name
                );
                return {
                    ...plugin,
                    indexPath: path.join(pluginPath, './', plugin.entry),
                };
            } catch (e) {
                return false;
            }
        })
        .filter(Boolean);

    const hooks = {
        onReady: [],
    };

    systemPlugins.forEach((plugin) => {
        if (fs.existsSync(plugin.indexPath)) {
            //const pluginModule = __non_webpack_require__(plugin.indexPath)();
            //// @ts-ignore
            //hooks.onReady.push(pluginModule.onReady);
        }
    });

    const triggerReadyHooks = (ctx) => {
        // @ts-ignore
        hooks.onReady.forEach((hook: any) => {
            try {
                hook && hook(ctx);
            } catch (e) {
                console.log(e);
            }
        });
    };

    return {
        triggerReadyHooks,
    };
};