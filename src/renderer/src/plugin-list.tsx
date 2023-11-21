import { Avatar, List } from "antd";
import React from "react"

const PluginList = ({title, list}: PluginListProps) => {
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
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
}

export default PluginList;