import { Button } from "antd"
import PluginList from "./plugin-list";

import createPluginManager from './plugins-manager'
import { getGlobal } from "@electron/remote";
const pluginMgr = createPluginManager();
pluginMgr.initPlugins();

function App() {

  const installedPlugins: PluginListProps = {
    title: "Installed Plugins",
    list: [
      {
        title: 'Ant Design Title 1',
      },
      {
        title: 'Ant Design Title 2',
      },
      {
        title: 'Ant Design Title 3',
      },
      {
        title: 'Ant Design Title 4',
      },
    ]
  };

  //const localPlugins = getGlobal("LOCAL_PLUGINS").getLocalPlugins();

  const handleBrowsePlugins = (e) => {
    const dialog = require("@electron/remote").dialog;
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory']})
      .then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
      })
      .catch (err => {
        console.log(err);
      })
  }

  return (
    <div className="App">
      <h1>Electron-Vite-React-App</h1>
      <Button type="primary" onClick={handleBrowsePlugins}>Browse Plugins</Button>
      <PluginList
        {...installedPlugins}
      />
    </div>
  );
}

export default App
