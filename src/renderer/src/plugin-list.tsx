import { Avatar, List, Button } from "antd";
import { useDispatch } from "react-redux";
import { refreshInstalledPlugins } from "./store/pluginSlice";

const remote = require("@electron/remote");

const PluginList = ({ title, list }: PluginListProps) => {

    const dispatch = useDispatch();

    const handlePluginUninstall = async (plugin) => {
        await remote.getGlobal('LOCAL_PLUGINS').deletePlugin(plugin);
        dispatch(refreshInstalledPlugins());
    }

    return (
        <div className="panel-item">
            <h3 className="title">{title}</h3>
            <div className="list-item">
                <List
                    itemLayout="horizontal"
                    dataSource={list}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`} />}
                                title={<a href="https://ant.design">{item.title}</a>}
                                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                            />
                            <Button type="primary"
                                    onClick={() => handlePluginUninstall({name: `${item.title}`})}>uninstall</Button>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
}

export default PluginList;