import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { AnnotationStore, FileStore, ProjectsStore } from "../../../../stores";
import { Tree } from "antd";

import { getTreeData } from "../../FolderDialog.utils";
import { Status } from "../../..";
import FileIconSwitcher from "../../../../util/FileIconSwitcher";

import "./estimatestree.less";
import { getSortedTreeData } from "../../../../drive/components/DriveTree/DriveTree.utils";

const EstimatesTree = ({ filterValue, onDoubleClickDrive, onCancel, selectedKeys }) => {
    const expandedKeys = localStorage.getItem(`quickSwitchexpandedKeys_${ProjectsStore.getActiveProjectId()}`)
        ? new Set(JSON.parse(localStorage.getItem(`quickSwitchexpandedKeys_${ProjectsStore.getActiveProjectId()}`)))
        : new Set();

    const getTreeData = getSortedTreeData(FileStore.getTreeData());
    if (getTreeData.length > 0) {
        expandedKeys.add(getTreeData[0].id);
    }
    const [quickSwitchexpandedKeys, setquickSwitchexpandedKeys] = useState(expandedKeys);

    const history = useHistory();

    const renderTreeItem = (item) => (
        <div>
            <label className="TreeItem_Label">{item.title}</label>
            {getStatusForAnnotation(item, false)}
        </div>
    );

    const renderListItem = (item) => {
        const nodeIcon = item.type === "folder" ? <FileIconSwitcher type="folder" /> : item.icon;
        return (
            <div className="ListItemContainer" onDoubleClick={(e) => onDoubleClick(e, item)}>
                <div className="ItemIcon">{nodeIcon}</div>
                <label>{item.title}</label>
                {getStatusForAnnotation(item, true)}
            </div>
        );
    };

    const getStatusForAnnotation = (item, list) => {
        const classes = list ? `Tree_Icon Tree_Circle_Icon List_Icon` : "Tree_Status";
        return (
            <div className={classes}>
                {item.type !== "folder" && (
                    <Status
                        notStarted={item.nodeStatus === "notStarted" || !item.nodeStatus}
                        progress={item.nodeStatus === "progress"}
                        review={item.nodeStatus === "review"}
                        complete={item.nodeStatus === "complete"}
                    />
                )}
                {item.type === "folder" && item.statuses && Object.values(item.statuses).some((x) => x > 0) && (
                    <Status
                        notStarted={item.statuses.notStarted > 0}
                        progress={item.statuses.progress > 0}
                        review={item.statuses.review > 0}
                        complete={item.statuses.complete > 0}
                    />
                )}
            </div>
        );
    };

    const onDoubleClick = (_, data) => {
        const inDriveView = history.location.pathname.includes("drive");
        if (inDriveView) {
            onDoubleClickDrive(data);
            return;
        }
        if (data.id !== AnnotationStore.getActiveFileId()) {
            switch (data.type) {
                case "folder":
                    history.push(`/projects/${ProjectsStore.getActiveProjectId()}/drive#${data.key}`);
                    break;
                default:
                    window.history.pushState({}, null, `/projects/${ProjectsStore.getActiveProjectId()}/calculate/${data.key}`);
                    AnnotationStore.jumpToFile(data);
                    break;
            }
            onCancel();
        }
    };

    const onExpand = (keys) => {
        setquickSwitchexpandedKeys(keys);
        localStorage.setItem(`quickSwitchexpandedKeys_${ProjectsStore.getActiveProjectId()}`, JSON.stringify(keys));
    };

    const [renderData, setRenderData] = useState([]);

    useEffect(() => {
        if (filterValue !== "") {
            try {
                let regex = new RegExp(filterValue.replace(/[\|.\\]/g), "i");
                let filteredArr = FileStore.getTreeList().filter((elem) => {
                    return regex.test(elem.title);
                });
                setRenderData(filteredArr);
            } catch (e) {
                console.log(e.message);
                setRenderData([]);
            }
        } else {
            setRenderData([...FileStore.getTreeList()]);
        }
    }, [filterValue]);

    return filterValue === "" ? (
        <Tree.DirectoryTree
            checkStrictly={true}
            treeData={getTreeData}
            titleRender={renderTreeItem}
            defaultExpandAll
            defaultSelectedKeys={[AnnotationStore.getActiveFileId()]}
            showLine={{ showLeafIcon: false }}
            showIcon
            onClick={onDoubleClick}
            onExpand={onExpand}
            expandedKeys={[...quickSwitchexpandedKeys]}
            className="Estimates_Tree Estimates_TreeColor"
            selectedKeys={selectedKeys}
        />
    ) : (
        renderData.map((item) => renderListItem(item))
    );
};

export default EstimatesTree;
