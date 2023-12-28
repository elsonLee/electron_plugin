import { Button } from "antd"
import PluginList from "./plugin-list";

import createPluginManager from './plugins-manager'
import { useSelector, useDispatch } from "react-redux";
import { decrement, increment } from "./store/counterSlice";
import { RootState } from './store'
import { initPlugins } from "./store/pluginSlice";

const remote = require("@electron/remote");

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

  const handleBrowsePlugins = (e) => {
    console.log("global.testVar: ", remote.getGlobal('testVar'));
    const localPlugins = remote.getGlobal('LOCAL_PLUGINS').getLocalPlugins();
    console.log("logcalPlugins: ", localPlugins);

    const dialog = require("@electron/remote").dialog;
    dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })
      .then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const count = useSelector((state: RootState) => state.counter.value)
  const localPlugins = useSelector((state: RootState) => {
    const plugins = state.plugins.localPlugins;
    console.log("plugins: ", plugins);
    return plugins.map((plugin, index) => {
      return Object.assign({}, {'title': plugin.name});
    });
  });
  const dispatch = useDispatch();

  return (
    <div className="App">
      <h1>Electron-Vite-React-App</h1>
      <Button type="primary" onClick={handleBrowsePlugins}>Browse Plugins</Button>
      <PluginList
        {
          ...installedPlugins
        }
        list={localPlugins}
      />
      <div>
        <Button
          type="primary"
          onClick={() => dispatch(initPlugins(""))}
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
