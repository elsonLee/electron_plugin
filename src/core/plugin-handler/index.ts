//import {
//    PluginHandlerOptions,
//    AdapterInfo,
//} from '@/core/plugin-handler/types';
import { PluginHandlerOptions, AdapterInfo } from '../plugin-handler/types';
//import fs from 'fs-extra';
import path from 'path';
//import got from 'got'
//import fixPath from 'fix-path';

import { ipcRenderer } from 'electron';
//import axios from 'axios';

// FIXME: shouldn't in browser process
const fs = process.type == "browser"?
            require('fs-extra') : require('@electron/remote').require('fs-extra');

//import npm from 'npm';
//const npm = process.type == "browser"?
//            require('npm') :
//            require('@electron/remote').require('npm');
import spawn from "cross-spawn";

//fixPath();

/**
 * 系统插件管理器
 * @class PluginHandler
 */
class PluginHandler {
    // 插件安装地址
    public baseDir: string;
    // 插件源地址
    readonly registry: string;

    pluginCaches = {};

    /**
     * Creates an instance of PluginHandler.
     * @param {PluginHandlerOptions} options
     * @memberof PluginHandler
     */
    constructor(options: PluginHandlerOptions) {
        // 初始化插件存放
        if (!fs.existsSync(options.baseDir)) {
            fs.mkdirsSync(options.baseDir);
            fs.writeFileSync(
                `${options.baseDir}/package.json`,
                '{"dependencies":{}}'
            );
        }
        this.baseDir = options.baseDir;

        // TODO: npm register
        let register = options.registry || 'https://registry.npmmirror.com/';

        try {
            const dbdata = ipcRenderer.sendSync('msg-trigger', {
                type: 'dbGet',
                data: { id: 'weblog-localhost-config' },
            });
            register = dbdata.data.register;
        } catch (e) {
            // ignore
        }
        //this.registry = register || 'https://registry.npmmirror.com/';
        this.registry = register;
    }

    //async upgrade(name: string): Promise<void> {
    //    // 创建一个npm-registry-client实例
    //    const packageJSON = JSON.parse(
    //        fs.readFileSync(`${this.baseDir}/package.json`, 'utf-8')
    //    );
    //    const registryUrl = `https://registry.npm.taobao.org/${name}`;

    //    // 从npm源中获取依赖包的最新版本
    //    try {
    //        const installedVersion = packageJSON.dependencies[name].replace('^', '');
    //        let latestVersion = this.pluginCaches[name];
    //        if (!latestVersion) {
    //            const { data } = await axios.get(registryUrl, { timeout: 2000 });
    //            latestVersion = data['dist-tags'].latest;
    //            this.pluginCaches[name] = latestVersion;
    //        }
    //        if (latestVersion > installedVersion) {
    //            await this.install([name], { isDev: false });
    //        }
    //    } catch (e) {
    //        // ...
    //    }
    //}
    /**
     * 获取插件信息
     * @param {string} adapter 插件名称
     * @param {string} adapterPath 插件指定路径
     * @memberof PluginHandler
     */
    async getAdapterInfo(
        adapter: string,
        adapterPath: string
    ): Promise<AdapterInfo> {
        let adapterInfo: AdapterInfo;
        const infoPath =
            adapterPath ||
            path.resolve(this.baseDir, 'node_modules', adapter, 'plugin.json');
        // 从本地获取
        if (await fs.pathExists(infoPath)) {
            adapterInfo = JSON.parse(
                fs.readFileSync(infoPath, 'utf-8')
            ) as AdapterInfo;
        } else {
            // FIXME
            // 本地没有从远程获取
            //const resp = await got.get(
            //    `https://cdn.jsdelivr.net/npm/${adapter}/plugin.json`
            //);
            // Todo 校验合法性
            //adapterInfo = JSON.parse(resp.body) as AdapterInfo;
            adapterInfo = { type: "adapter",
                            author: "",
                            description: "unknown",
                            logo: "",
                            name: "",
                            pluginName: "",
                            main: "",
                            version: ""}
        }
        return adapterInfo;
    }

    async install(adapters: Array<string>, options: { isDev: boolean }) {
        const cmd = options.isDev ? 'link' : 'install';
        await this.execNpmCmd(cmd, adapters);
    }

    async update(...adapters: string[]) {
        await this.execNpmCmd('update', adapters);
    }

    async uninstall(adapters: string[], options: { isDev: boolean }) {
        const cmd = options.isDev? 'unlink' : 'uninstall';
        await this.execNpmCmd(cmd, adapters);
    }

    /**
     * 列出所有已安装插件
     * @memberof PluginHandler
     */
    async list() {
        const installInfo = JSON.parse(
            await fs.readFile(`${this.baseDir}/package.json`, 'utf-8')
        );
        const adapters: string[] = [];
        for (const adapter in installInfo.dependencies) {
            adapters.push(adapter);
        }
        return adapters;
    }

    /**
     * npm operations
     * cmd:
     *  prod: "install"|"uninstall"|"update"
     *  TODO: dev:  "link"|"unlink"
     */
    private async execNpmCmd(cmd: string, modules: string[]): Promise<string> {
        return new Promise((resolve: any, reject: any) => {
            let args: string[] =
                [cmd].concat(modules)
                     .concat("--color=always")
                     .concat("--save");
            if (cmd != "uninstall") {
                args = args.concat(`--registry=${this.registry}`);
            }

            console.log("npm ", cmd, " ", args);

            // install into dir plugins
            const npm = spawn("npm", args, { cwd: this.baseDir, });

            let output = "";
            npm.stdout.on("data", (data: string) => {
                output += data;
            }).pipe(process.stdout);

            npm.stderr.on("data", (data: string) => {
                output += data;
            }).pipe(process.stderr);

            npm.on("close", (code: number) => {
                if (code == 0) {
                    resolve({code: 0, data: output});
                } else {
                    reject({code: code, data: output});
                }
            });
        });
    }

} // PluginHandler

export default PluginHandler;