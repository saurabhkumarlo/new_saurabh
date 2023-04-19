import "./drivetree.less";

import { Divider, Dropdown, Menu, Tag, Tree } from "antd";
import { ErrorFallback, Status } from "../../../components";
import React, { useRef, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getSortedTreeData } from "./DriveTree.utils";
import { getTreeData } from "../DriveProperties/components/EditPane/EditPane.utils";
import { useTranslation } from "react-i18next";

const DriveTree = ({
    role,
    treeData,
    onDriveTreeSelect,
    selectedKeys,
    forwardedRef,
    height,
    onExpand,
    expandedKeys,
    onDoubleClick,
    onMoveFile,
    onMoveFiles,
    draggable,
    checkedItems,
    setCheckedItems,
    onDeleteFile,
    onDeleteFolder,
    onOpenFolder,
    onOpenInCalculate,
    onDownloadFile,
    isUploadingFiles,
}) => {
    const [contextVisible, setContextVisible] = useState(false);
    const [contextMenuType, setContextMenuType] = useState("");
    const [showOpenContextMenu, setShowOpenContextMenu] = useState(false);
    const nodePositions = useRef({ dragNodePos: null, nodePos: null });
    const toFolderDetails = useRef({ key: null, pos: null });
    const { t } = useTranslation();
    const disableButtons = checkedItems.length !== 1 || checkedItems[0]?.parentId === null;

    const getFolderPosition = (arr, id, drag) => {
        const matchingNode = arr.find((node) => node.key === id);
        if (matchingNode) {
            drag ? (nodePositions.current.dragNodePos = matchingNode.pos) : (nodePositions.current.nodePos = matchingNode.pos);
            return;
        }
        for (const folder of arr) getFolderPosition(folder.children, id, drag);
    };
    const onDrop = (e) => {
        if (checkedItems.length > 0) {
            const currentFolder = e.node.type !== "folder" ? { pos: e.node.pos, key: e.node.parentId } : { pos: e.node.pos, key: e.node.key };
            onMoveFiles(checkedItems, currentFolder);
        } else {
            if (e.dragNode.type === "folder") {
                getFolderPosition(getTreeData(treeData), e.node.id, false);
                getFolderPosition(getTreeData(treeData), e.dragNode.id, true);
                if (nodePositions.current.dragNodePos !== null && nodePositions.current.nodePos !== null) {
                    e.node.pos = nodePositions.current.nodePos;
                    e.dragNode.pos = nodePositions.current.dragNodePos;
                    onMoveFile(e.dragNode, e.node);
                    nodePositions.current.dragNodePos = null;
                    nodePositions.current.nodePos = null;
                }
            } else {
                onMoveFile(e.dragNode, e.node);
            }
        }
    };
    const onClickSubMenu = (folder) => {
        closeContexMenu();
        getNodePosition(getTreeData(treeData), folder, true);
        checkedItems.forEach((node) => {
            if (node.type === "folder") getNodePosition(getTreeData(treeData), node, false);
        });
        if (toFolderDetails.current.key !== null && toFolderDetails.current.pos !== null) onMoveFiles(checkedItems, toFolderDetails.current);
        toFolderDetails.current.key = null;
        toFolderDetails.current.pos = null;
    };

    const getNodePosition = (arr, nodeToUpdate, isToNode) => {
        const matchingNode = arr.find((node) => node.key == nodeToUpdate.key);
        if (matchingNode) {
            if (isToNode) {
                toFolderDetails.current.key = matchingNode.key;
                toFolderDetails.current.pos = matchingNode.pos;
            } else {
                nodeToUpdate.pos = matchingNode.pos;
            }
            return;
        }
        for (const folder of arr) getNodePosition(folder.children, nodeToUpdate, isToNode);
    };
    const getFolderItems = (list) => {
        return list.map((folder) => {
            if (folder.type === "folder" && folder?.id !== checkedItems[0]?.id) {
                if (folder.children.length > 0) {
                    return (
                        <Menu.SubMenu
                            onTitleClick={onClickSubMenu}
                            key={folder.key}
                            title={folder.title}
                            popupClassName="ContextMenu_SubMenu"
                            style={{ display: contextVisible ? "list-item" : "none" }}
                        >
                            {getFolderItems(folder.children)}
                        </Menu.SubMenu>
                    );
                } else {
                    if (folder?.id !== checkedItems[0]?.id) {
                        return (
                            <Menu.Item
                                onClick={onClickSubMenu}
                                key={folder.key}
                                className="ContextMenu_SubMenu"
                                style={{ display: contextVisible ? "list-item" : "none" }}
                            >
                                {folder.title}
                            </Menu.Item>
                        );
                    }
                }
            }
        });
    };
    const onRightClick = (node) => {
        setContextVisible(true);
        setContextMenuType(node.type);
        onDriveTreeSelect(node.id, { node });
    };
    const closeContexMenu = () => setContextVisible(false);
    const onDeleteHandler = (file) => {
        file ? onDeleteFile(checkedItems) : onDeleteFolder(checkedItems);
        closeContexMenu();
    };
    const onOpenInCalculateHandler = (inNewTab) => {
        onOpenInCalculate(checkedItems[0], inNewTab);
        closeContexMenu();
    };
    const onDownloadFileHandler = () => {
        onDownloadFile(checkedItems[0], true);
        closeContexMenu();
    };
    const onOpenFolderHandler = () => {
        onOpenFolder(checkedItems[0]);
        closeContexMenu();
    };
    const onVisibleChangeHandler = (e) => {
        if (e === false) setContextVisible(e);
    };
    const renderTreeItem = (item) => {
        return (
            <div className="Tree_Item_Wrapper">
                <label>{item.title}</label>
                <div className="Tree_Status">
                    {item && item.type !== "folder" && (
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
            </div>
        );
    };

    const checkOnDrag = (e) => {
        if (checkedItems.length > 0) {
            const checkCurrentItem = checkedItems.find((item) => e.node.key === item.key);
            if (!checkCurrentItem) {
                setCheckedItems([e.node]);
                return;
            }
            return;
        }
        setCheckedItems([e.node]);
    };

    const driveItemFileActions = () => (
        <Menu className="Calculate_Rows_ContextMenu">
            <Menu.SubMenu
                disabled={!role}
                key="move"
                title={t("GENERAL.MOVE")}
                icon={<FontAwesomeIcon icon={["fal", "stream"]} />}
                popupClassName="ContextMenu_SubMenu"
            >
                {getFolderItems(treeData)}
            </Menu.SubMenu>
            <Divider />
            <Menu.Item key="open" onClick={() => onOpenInCalculateHandler(false)} disabled={disableButtons}>
                <FontAwesomeIcon icon={["fal", "external-link-square"]} />
                {
                    <span>
                        {t("GENERAL.OPEN")}
                        <Tag style={{ float: "right" }}>Ctrl + O</Tag>
                    </span>
                }
            </Menu.Item>
            <Menu.Item key="openInTab" onClick={() => onOpenInCalculateHandler(true)} disabled={disableButtons}>
                <FontAwesomeIcon icon={["fal", "external-link"]} />
                {t("GENERAL.OPEN_IN_NEW_TAB")}
            </Menu.Item>
            <Menu.Item key="download" onClick={onDownloadFileHandler} disabled={disableButtons}>
                <FontAwesomeIcon icon={["fal", "cloud-download"]} />
                {
                    <span>
                        {t("GENERAL.DOWNLOAD")}
                        <Tag style={{ float: "right" }}>Ctrl + D</Tag>
                    </span>
                }
            </Menu.Item>
            <Divider />
            <Menu.Item key="delete" onClick={() => onDeleteHandler(true)} danger disabled={disableButtons || !role}>
                <FontAwesomeIcon icon={["fal", "trash"]} />
                {
                    <span>
                        {t("GENERAL.DELETE")}
                        <Tag style={{ float: "right" }}>Delete</Tag>
                    </span>
                }
            </Menu.Item>
        </Menu>
    );

    const driveItemFolderActions = () => (
        <Menu className="Calculate_Rows_ContextMenu">
            <Menu.SubMenu
                disabled={!role || !checkedItems[0]?.parentId}
                key="move"
                title={t("GENERAL.MOVE")}
                icon={<FontAwesomeIcon icon={["fal", "stream"]} />}
                popupClassName="ContextMenu_SubMenu"
            >
                {getFolderItems(treeData)}
            </Menu.SubMenu>

            {showOpenContextMenu && (
                <>
                    <Divider />
                    <Menu.Item key="open" onClick={onOpenFolderHandler} disabled={disableButtons}>
                        <FontAwesomeIcon icon={["fal", "external-link-square"]} />
                        {
                            <span>
                                {t("GENERAL.OPEN")}
                                <Tag style={{ float: "right" }}>Ctrl + O</Tag>
                            </span>
                        }
                    </Menu.Item>
                </>
            )}
            <Divider />
            <Menu.Item key="delete" onClick={onDeleteHandler} danger disabled={disableButtons || !role}>
                <FontAwesomeIcon icon={["fal", "trash"]} />
                {
                    <span>
                        {t("GENERAL.DELETE")}
                        <Tag style={{ float: "right" }}>Delete</Tag>
                    </span>
                }
            </Menu.Item>
        </Menu>
    );

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Dropdown
                trigger={["contextMenu"]}
                overlay={contextMenuType === "folder" ? driveItemFolderActions : driveItemFileActions}
                arrow
                placement="bottomLeft"
                visible={contextVisible}
                onVisibleChange={(e) => onVisibleChangeHandler(e)}
            >
                <Tree.DirectoryTree
                    allowDrop={() => true}
                    checkStrictly={true}
                    treeData={getSortedTreeData(treeData)}
                    titleRender={renderTreeItem}
                    defaultExpandAll
                    onSelect={(id, e) => !isUploadingFiles && onDriveTreeSelect(id, e)}
                    selectedKeys={selectedKeys}
                    showLine={{ showLeafIcon: false }}
                    draggable={draggable}
                    ref={forwardedRef}
                    onDrop={onDrop}
                    expandAction={"doubleClick"}
                    onDragStart={(e) => checkOnDrag(e)}
                    height={height}
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    onDoubleClick={onDoubleClick}
                    onRightClick={({ node }) => onRightClick(node)}
                    className="Drive_Tree"
                />
            </Dropdown>
        </ErrorBoundary>
    );
};

export default React.forwardRef((props, ref) => {
    return <DriveTree {...props} forwardedRef={ref} />;
});
