import { Button } from "antd"
import PluginList from "./plugin-list";

import createPluginManager from './plugins-manager'
import { useSelector, useDispatch } from "react-redux";
import { decrement, increment } from "./store/counterSlice";
import { RootState } from './store'

import { refreshInstalledPlugins } from "./store/pluginSlice";

const remote = require("@electron/remote");

const pluginMgr = createPluginManager();
pluginMgr.initPlugins();

function App() {

  const installedPlugins: PluginListProps = {
    title: "Installed Plugins",
    list: []
  };

  const count = useSelector((state: RootState) => state.counter.value);
  const localPlugins = useSelector((state: RootState) => {
    const plugins = state.plugins.localPlugins;
    const pluginList = plugins.map((plugin, index) => {
      return Object.assign({}, { 'title': plugin.name });
    });
    console.log("load to list: ", pluginList)
    return pluginList;
  });
  const dispatch = useDispatch();

  const handleLocalPluginInstall = async () => {
    const dialog = require("@electron/remote").dialog;
    // TODO: 'multiSelections'
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'package', extensions: ['tgz']}
        ]
      })
      .then(async (result) => {
        console.log(result.canceled);
        console.log(result.filePaths);
        await remote.getGlobal('LOCAL_PLUGINS').installPlugin({
          name: result.filePaths[0],
          isDev: false
        });
        dispatch(refreshInstalledPlugins());
      })
      .catch(err => {
        console.log(err);
      })
  }

  return (
    <div className="App">
      <Button type="primary"
              onClick={() => handleLocalPluginInstall()}
            >Install Local Plugin</Button>
      <PluginList
        title="Installed Plugins"
        list={localPlugins}
      />
      <div>
        <Button
          type="primary"
          onClick={() => dispatch(increment())}
          >Increment</Button>
        <span>{count}</span>
        <Button
          type="primary"
          onClick={() => dispatch(decrement())}
          >Decrement</Button>
      </div>
    </div>
  );
}

export default App
