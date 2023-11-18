import { Button } from "antd"
import { Avatar, List } from 'antd'

const data = [
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
];

import createPluginManager from './plugins-manager'
//const {
//  initPlugins,
//  getPluginInfo,
//  openPlugin,
//  currentPlugin,
//  pluginLoading
//} = createPluginManager();
//const pluginMgr = createPluginManager();

function App() {
  return <div className="App">
    <h1>Electron-Vite-React-App</h1>
    <Button type="primary">Load Plugin</Button>

    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item, index) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`} />}
            title={<a href="https://ant.design">{item.title}</a>}
            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
          />
        </List.Item>
      )}
    />

  </div>
}

export default App
