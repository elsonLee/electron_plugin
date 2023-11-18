import React from 'react'
import ReactDOM from 'react-dom/client'
//import './assets/index.css'
import App from './App'

import createPluginManager from './plugins-manager'
const pluginMgr = createPluginManager();
pluginMgr.initPlugins();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
