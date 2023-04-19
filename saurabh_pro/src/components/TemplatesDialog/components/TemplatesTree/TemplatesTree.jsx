import "./templatestree.less";

import { Button, Dropdown, Menu, Tree } from "antd";
import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "..";
import { useTranslation } from "react-i18next";

const TemplatesTree = ({ treeData, type, onUpdateFolder, isAddingFolder, onAddFolder, onDeleteFolder, selectedNodeId, onChangeSelectedNodeId }) => {
    const { t } = useTranslation();
    const [activeInputId, setActiveInputId] = useState();
    const [activeObject, setActiveObject] = useState();

    const renderCalculateTreeItem = (item) => {
        return (
            <Dropdown overlay={() => FolderDropdown(item)} trigger={["contextMenu"]}>
                {activeInputId !== item.id ? (
                    <div className="Item_Container">
                        <label onDoubleClick={() => onDoubleClick(item.id, "tag")}>{item.tag ? item.tag : <span className="Empty_Item">Nr/Tag</span>}</label>
                        <label onDoubleClick={() => onDoubleClick(item.id, "name")}>{item.name ? item.name : <span className="Empty_Item">Name</span>}</label>
                    </div>
                ) : activeObject === "tag" ? (
                    <div className="Item_Container">
                        <Input item={item} object="tag" objectName="Nr/Tag" treeInput onBlur={onBlur} onPressEnter={onUpdateFolder} />
                        <label onDoubleClick={() => onDoubleClick(item.id, "name")}>{item.name ? item.name : <span className="Empty_Item">Name</span>}</label>
                    </div>
                ) : (
                    <div className="Item_Container">
                        <label onDoubleClick={() => onDoubleClick(item.id, "tag")}>{item.tag ? item.tag : <span className="Empty_Item">Nr/Tag</span>}</label>
                        <Input item={item} object="name" objectName="Name" treeInput onBlur={onBlur} onPressEnter={onUpdateFolder} />
                    </div>
                )}
            </Dropdown>
        );
    };

    const renderDriveTreeItem = (item) => {
        return (
            <Dropdown overlay={() => FolderDropdown(item)} trigger={["contextMenu"]}>
                {activeInputId !== item.id ? (
                    <div className="Item_Container">
                        <label onDoubleClick={() => onDoubleClick(item.id, "name")}>{item.name ? item.name : <span className="Empty_Item">Name</span>}</label>
                    </div>
                ) : (
                    <div className="Item_Container">
                        <Input item={item} object="name" objectName="Name" treeInput onBlur={onBlur} onPressEnter={onUpdateFolder} />
                    </div>
                )}
            </Dropdown>
        );
    };

    const FolderDropdown = (item) => (
        <Menu className="Calculate_Rows_ContextMenu">
            <Menu.Item key="delete" onClick={() => onDeleteFolder(item.id)} danger>
                <FontAwesomeIcon icon={["fal", "trash"]} />
                {t("GENERAL.DELETE")}
            </Menu.Item>
        </Menu>
    );

    const onDoubleClick = (id, type) => {
        setActiveInputId(id);
        setActiveObject(type);
    };

    const onBlur = () => {
        setActiveInputId();
        setActiveObject();
    };

    const onDrop = (event) => {
        const { dragNode, node, dropPosition } = event;
        if (dropPosition === -1) onUpdateFolder(dragNode.id, false, null, false);
        else onUpdateFolder(dragNode.id, false, node.id, false);
    };

    return (
        <>
            <Button
                type="text"
                icon={<FontAwesomeIcon icon={["fal", "plus-circle"]} />}
                className="Action_Button"
                disabled={isAddingFolder}
                loading={isAddingFolder}
                onClick={() => onAddFolder(selectedNodeId, t("GENERAL.ADD_FOLDER"))}
            >
                {t("GENERAL.ADD_FOLDER")}
            </Button>
            <Tree
                treeData={treeData}
                titleRender={type === "drive" ? renderDriveTreeItem : renderCalculateTreeItem}
                defaultExpandAll={true}
                autoExpandParent={true}
                showLine={{ showLeafIcon: false }}
                showIcon
                className="Templates_Tree"
                selectedKeys={[selectedNodeId]}
                onSelect={(id) => onChangeSelectedNodeId(id[0])}
                draggable
                onDrop={onDrop}
            />
        </>
    );
};

export default TemplatesTree;
