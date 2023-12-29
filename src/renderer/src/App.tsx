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
    return plugins.map((plugin, index) => {
      return Object.assign({}, { 'title': plugin.name });
    });
  });
  const dispatch = useDispatch();

  const handleInstallLocalPlugin = () => {
    const dialog = require("@electron/remote").dialog;
    // TODO: 'multiSelections'
    dialog.showOpenDialog(
      {
        properties: ['openFile'],
        filters: [
          { name: 'package', extensions: ['tgz']}
        ]
      }
      )
      .then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
        remote.getGlobal('LOCAL_PLUGINS').downloadPlugin({
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
              onClick={() => handleInstallLocalPlugin()}
            >Install Local Plugin</Button>
      <PluginList {
          ...installedPlugins
        }
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
