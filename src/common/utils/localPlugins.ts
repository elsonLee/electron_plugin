import path from 'path';
import fs from 'fs';
import fsextra from 'fs-extra';
import tar from 'tar';
import { PluginHandler } from '../../core';
import API from '../../main/common/api';

import { PLUGIN_INSTALL_DIR as pluginInstallDir } from '../constans/main';
import { trace } from 'console';
import { tmpdir } from 'os';

const configPath = path.join(pluginInstallDir, './weblog-local-plugin.json');

let registry;
let pluginInstance;
(async () => {
    try {
        // config npm registry in weblog-localhost-config
        const res = await API.dbGet({
            data: {
                id: 'weblog-localhost-config',
            },
        });

        registry = res && res.data.register;
        pluginInstance = new PluginHandler({
            baseDir: pluginInstallDir,
            registry: registry,
        });
    } catch (e) {
        pluginInstance = new PluginHandler({
            baseDir: pluginInstallDir,
            registry: registry,
        });
    }
})();

function getPackageNameFromTgz(tgzFilePath: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    tar.extract({
      file: tgzFilePath,
      cwd: tempDir,
    })
    .then(() => {
      // 读取解压后的 package.json 文件
      const packageJsonPath = `${tempDir}/package/package.json`;
      if (fs.existsSync(packageJsonPath)) {
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        const packageName = packageJson.name;
        resolve(packageName);
      } else {
        reject(new Error('package.json not found in the tgz file.'));
      }
    })
    .catch((error) => {
      reject(error);
    })
    .finally(() => {
        //fs.rmdirSync(tempDir, { recursive: true });
        fsextra.removeSync(tempDir);
    })
  });
}

global.LOCAL_PLUGINS = {
    PLUGINS: [],

    async downloadPlugin(plugin) {
        
        console.log("type plugin.name: ", typeof plugin.name);

        // FIXME: plugin.name may be a name or tgz path or dir path
        await pluginInstance.install([plugin.name], { isDev: plugin.isDev });
        console.log("Plugin installed: ", plugin.name)

        const pluginFile: string = plugin.name;
        if (pluginFile.endsWith('.tgz')) {
            getPackageNameFromTgz(pluginFile)
                .then((packageName) => {
                    console.log('Package Name:', packageName);
                    plugin.name = packageName;
                })
                .catch((error) => {
                    console.error('Error getting package name from tgz:', error);
                    return global.LOCAL_PLUGINS.PLUGINS;
                });
        }

        if (plugin.isDev) {
            // 获取 dev 插件信息
            const pluginPath = path.resolve(pluginInstallDir, 'node_modules', plugin.name);
            console.log("pluginPath: ", pluginPath);

            const pluginInfo = JSON.parse(
                fs.readFileSync(path.join(pluginPath, './package.json'), 'utf8')
            );
            console.log("pluginInfo: ", pluginInfo);

            plugin = {
                ...plugin,
                ...pluginInfo,  // NOTE: plugin name will use package.json version
            };
        }
        global.LOCAL_PLUGINS.addPlugin(plugin);
        return global.LOCAL_PLUGINS.PLUGINS;
    },

    refreshPlugin(plugin) {
        console.log("refreshPlugin");
        // 获取 dev 插件信息
        const pluginPath = path.resolve(pluginInstallDir, 'node_modules', plugin.name);
        const pluginInfo = JSON.parse(
            fs.readFileSync(path.join(pluginPath, './package.json'), 'utf8')
        );
        plugin = {
            ...plugin,
            ...pluginInfo,
        };
        // 刷新
        let currentPlugins = global.LOCAL_PLUGINS.getLocalPlugins();

        currentPlugins = currentPlugins.map((p) => {
            if (p.name === plugin.name) {
                return plugin;
            }
            return p;
        });

        // 存入
        global.LOCAL_PLUGINS.PLUGINS = currentPlugins;
        fs.writeFileSync(configPath, JSON.stringify(currentPlugins));
        return global.LOCAL_PLUGINS.PLUGINS;
    },

    getLocalPlugins() {
        console.log("configPath: " + configPath);
        try {
            if (!global.LOCAL_PLUGINS.PLUGINS.length) {
                global.LOCAL_PLUGINS.PLUGINS = JSON.parse(
                    fs.readFileSync(configPath, 'utf-8')
                );
            }
            return global.LOCAL_PLUGINS.PLUGINS;
        } catch (e) {
            global.LOCAL_PLUGINS.PLUGINS = [];
            return global.LOCAL_PLUGINS.PLUGINS;
        }
    },

    addPlugin(plugin) {
        let has = false;
        const currentPlugins = global.LOCAL_PLUGINS.getLocalPlugins();
        currentPlugins.some((p) => {
            has = p.name === plugin.name;
            return has;
        });
        if (!has) {
            currentPlugins.unshift(plugin);
            global.LOCAL_PLUGINS.PLUGINS = currentPlugins;
            fs.writeFileSync(configPath, JSON.stringify(currentPlugins));
        }
    },

    updatePlugin(plugin) {
        global.LOCAL_PLUGINS.PLUGINS = global.LOCAL_PLUGINS.PLUGINS.map(
            (origin) => {
                if (origin.name === plugin.name) {
                    return plugin;
                }
                return origin;
            }
        );
        fs.writeFileSync(configPath, JSON.stringify(global.LOCAL_PLUGINS.PLUGINS));
    },

    async deletePlugin(plugin) {
        await pluginInstance.uninstall([plugin.name], { isDev: plugin.isDev });
        global.LOCAL_PLUGINS.PLUGINS = global.LOCAL_PLUGINS.PLUGINS.filter(
            (p) => plugin.name !== p.name
        );
        fs.writeFileSync(configPath, JSON.stringify(global.LOCAL_PLUGINS.PLUGINS));
        return global.LOCAL_PLUGINS.PLUGINS;
    },
};