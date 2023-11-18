import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
//import commonjs from '@rollup/plugin-commonjs'

import optimizer from 'vite-plugin-optimizer'

let getReplacer = () => {
  let externalModels = ["fs", "path", "os", "util", "buffer",
                        "process", "assert", "events", "stream",
                        "child_process", "constants", "ipcRenderer"];
  let result = {};
  for (let item of externalModels) {
      result[item] = () => ({
        //find: new RegExp(`^(node:)?${item}$`),
        find: /^${item}$/,
        code: `const ${item} = require('${item}'); export { ${item} as default }`,
      });
  }
  return result;
}

//optimizer({
//  // optimize Electron for using `ipcRenderer` in Electron-Renderer
//  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
//
//  // this means that both 'fs' and 'node:fs' are supported
//  // e.g.
//  //   `import fs from 'fs'`
//  //   or
//  //   `import fs from 'node:fs'`
//  fs: () => ({
//    // this is consistent with the `alias` behavior
//    find: /^(node:)?fs$/,
//    code: `const fs = require('fs'); export { fs as default };`
//  }),
//
//  path: () => ({
//    // this is consistent with the `alias` behavior
//    find: /^(node:)?path$/,
//    code: `const fs = require('path'); export { path as default };`
//  }),
//})

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), optimizer(getReplacer()),
      // node:<xxx>
      optimizer({
        'electron': `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
        'node:process': () => ({
          find: /^node:process$/,
          code: `const process = require('node:process'); export { process as default };`
        }),
        'node:os': () => ({
          find: /^node:os$/,
          code: `const os = require('node:os'); const userInfo = os.userInfo; export {userInfo};`
        })
      })
    ]
  }
})
