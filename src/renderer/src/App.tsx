import { Button } from "antd"
import PluginList from "./plugin-list";

import createPluginManager from './plugins-manager'
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

  return (
    <div className="App">
      <h1>Electron-Vite-React-App</h1>
      <Button type="primary">Load Plugin</Button>
      <PluginList
        {...installedPlugins}
      />
    </div>
  );
}

export default App
