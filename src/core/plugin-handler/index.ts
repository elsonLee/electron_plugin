//import {
//    AdapterHandlerOptions,
//    AdapterInfo,
//} from '@/core/plugin-handler/types';
import { AdapterHandlerOptions, AdapterInfo } from '../plugin-handler/types';
import fs from 'fs-extra';
import path from 'path';
//import got from 'got'
//import fixPath from 'fix-path';

import { ipcRenderer } from 'electron';
//import axios from 'axios';

//import npm from 'npm';

//fixPath();

/**
 * 系统插件管理器
 * @class AdapterHandler
 */
class AdapterHandler {
    // 插件安装地址
    public baseDir: string;
    // 插件源地址
    readonly registry: string;

    pluginCaches = {};

    /**
     * Creates an instance of AdapterHandler.
     * @param {AdapterHandlerOptions} options
     * @memberof AdapterHandler
     */
    constructor(options: AdapterHandlerOptions) {
        // 初始化插件存放
        if (!fs.existsSync(options.baseDir)) {
            fs.mkdirsSync(options.baseDir);
            fs.writeFileSync(
                `${options.baseDir}/package.json`,
                '{"dependencies":{}}'
            );
        }
        this.baseDir = options.baseDir;

        //let register = options.registry || 'https://registry.npmmirror.com/';
        let register = options.registry || '';

        try {
            const dbdata = ipcRenderer.sendSync('msg-trigger', {
                type: 'dbGet',
                data: { id: 'rubick-localhost-config' },
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

    // 安装并启动插件
    async install(adapters: Array<string>, options: { isDev: boolean }) {
        const installCmd = options.isDev ? 'link' : 'install';
        // 安装
        await this.execCommand(installCmd, adapters);
    }

    /**
     * 更新指定插件
     * @param {...string[]} adapters 插件名称
     * @memberof AdapterHandler
     */
    async update(...adapters: string[]) {
        await this.execCommand('update', adapters);
    }

    /**
     * 卸载指定插件
     * @param {...string[]} adapters 插件名称
     * @param options
     * @memberof AdapterHandler
     */
    async uninstall(adapters: string[], options: { isDev: boolean }) {
        const installCmd = options.isDev ? 'unlink' : 'uninstall';
        // 卸载插件
        await this.execCommand(installCmd, adapters);
    }

    /**
     * 列出所有已安装插件
     * @memberof AdapterHandler
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
     * 运行包管理器
     * @memberof AdapterHandler
     */
    private async execCommand(cmd: string, modules: string[]): Promise<string> {
        return new Promise((resolve: any, reject: any) => {
            const module =
                cmd !== 'uninstall' && cmd !== 'link'
                    ? modules.map((m) => `${m}@latest`)
                    : modules;
            const config: any = {
                prefix: this.baseDir,
                save: true,
                cache: path.join(this.baseDir, 'cache'),
            };
            if (cmd !== 'link') {
                config.registry = this.registry;
            }
            npm.load(config, function (err) {
                npm.commands[cmd](module, function (er, data) {
                    if (!err) {
                        console.log(data);
                        resolve({ code: -1, data });
                    } else {
                        reject({ code: -1, data: err });
                    }
                });

                npm.on('log', function (message) {
                    // log installation progress
                    console.log(message);
                });
            });

            // if (cmd !== 'link') {
            //   args = args
            //     .concat('--color=always')
            //     .concat('--save')
            //     .concat(`--registry=${this.registry}`);
            // }

            // const npm = spawn('npm', args, {
            //   cwd: this.baseDir,
            // });
            //
            // console.log(args);
            //
            // let output = '';
            // npm.stdout
            //   .on('data', (data: string) => {
            //     output += data; // 获取输出日志
            //   })
            //   .pipe(process.stdout);
            //
            // npm.stderr
            //   .on('data', (data: string) => {
            //     output += data; // 获取报错日志
            //   })
            //   .pipe(process.stderr);
            //
            // npm.on('close', (code: number) => {
            //   if (!code) {
            //     resolve({ code: 0, data: output }); // 如果没有报错就输出正常日志
            //   } else {
            //     reject({ code: code, data: output }); // 如果报错就输出报错日志
            //   }
            // });
        });
    }
}

export default AdapterHandler;