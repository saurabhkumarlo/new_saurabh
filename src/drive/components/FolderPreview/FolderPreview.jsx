import React, { useRef, useEffect } from "react";

import { Card, Dropdown, Empty, List, Menu, Tooltip, Typography, Checkbox, Divider, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { sortBy, filter } from "lodash";

import FileIconSwitcher from "../../../util/FileIconSwitcher";

import "./folderpreview.less";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback, Status } from "../../../components";
import { getTreeData } from "../DriveProperties/components/EditPane/EditPane.utils";
import { UploadingDialog } from "../../components";
import { FileStore, AuthenticationStore } from "../../../stores";

const FolderPreview = ({
    selectedNode,
    onDeleteFile,
    onOpenInCalculate,
    onDeleteFolder,
    onOpenFolder,
    onDownloadFile,
    checkedItems,
    setCheckedItems,
    selectionByClick,
    treeData,
    onMoveFile,
    multipleFilesLoader,
}) => {
    const toFolderDetails = useRef({ key: null, pos: null });
    const { t } = useTranslation();

    useEffect(() => {
        (async function () {
            await FileStore.initWebViewer(document.getElementById("fileTest"), true);
        })();
        return () => FileStore.cleanup();
    }, []);

    const onClickSubMenu = (folder) => {
        getNodePosition(getTreeData(treeData), folder, true);
        checkedItems.forEach((node) => {
            if (node.type === "folder") getNodePosition(getTreeData(treeData), node, false);
        });
        if (toFolderDetails.current.key !== null && toFolderDetails.current.pos !== null) onMoveFile(checkedItems, toFolderDetails.current);
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

    const onRightClick = (item) => {
        if (checkedItems.some((checked) => checked.key === item[0].key)) return;
        setCheckedItems(item);
    };

    const getFolderItems = (list) => {
        return list.map((folder) => {
            if (folder.type === "folder") {
                if (folder.children.length > 0) {
                    return (
                        <Menu.SubMenu onTitleClick={onClickSubMenu} key={folder.key} title={folder.title} popupClassName="ContextMenu_SubMenu">
                            {getFolderItems(folder.children)}
                        </Menu.SubMenu>
                    );
                } else {
                    return (
                        <Menu.Item onClick={onClickSubMenu} key={folder.key} className="ContextMenu_SubMenu">
                            {folder.title}
                        </Menu.Item>
                    );
                }
            }
        });
    };

    const driveItemFolderActions = (item) => (
        <Menu className="Calculate_Rows_ContextMenu">
            <Menu.SubMenu
                disabled={!AuthenticationStore.getRole()}
                key="move"
                title={t("GENERAL.MOVE")}
                icon={<FontAwesomeIcon icon={["fal", "stream"]} />}
                popupClassName="ContextMenu_SubMenu"
            >
                {getFolderItems(treeData)}
            </Menu.SubMenu>
            <Divider />
            <Menu.Item key="open" onClick={() => onOpenFolder(item)}>
                <FontAwesomeIcon icon={["fal", "external-link-square"]} />
                {<span>{t("GENERAL.OPEN")}<Tag style={{float: 'right'}}>Ctrl + O</Tag></span>}
            </Menu.Item>
            <Divider />
            <Menu.Item disabled={!AuthenticationStore.getRole()} key="delete" onClick={() => onDeleteFolder([item])} danger>
                <FontAwesomeIcon icon={["fal", "trash"]} />
                {<span>{t("GENERAL.DELETE")}<Tag style={{float: 'right'}}>Delete</Tag></span>}
            </Menu.Item>
        </Menu>
    );

    const driveItemFileActions = (item) => (
        <Menu className="Calculate_Rows_ContextMenu">
            <Menu.SubMenu
                disabled={!AuthenticationStore.getRole()}
                key="move"
                title={t("GENERAL.MOVE")}
                icon={<FontAwesomeIcon icon={["fal", "stream"]} />}
                popupClassName="ContextMenu_SubMenu"
            >
                {getFolderItems(treeData)}
            </Menu.SubMenu>
            <Divider />
            <Menu.Item key="open" onCl ick={() => onOpenInCalculate(item)}>
                <FontAwesomeIcon icon={["fal", "external-link-square"]} />
                {<span>{t("GENERAL.OPEN")}<Tag style={{float: 'right'}}>Ctrl + O</Tag></span>}
            </Menu.Item>
            <Menu.Item key="openInTab" onClick={() => onOpenInCalculate(item, true)}>
                <FontAwesomeIcon icon={["fal", "external-link"]} />
                {t("GENERAL.OPEN_IN_NEW_TAB")}
            </Menu.Item>
            <Menu.Item key="download" onClick={() => onDownloadFile(item, true)}>
                <FontAwesomeIcon icon={["fal", "cloud-download"]} />
                {<span>{t("GENERAL.DOWNLOAD")}<Tag style={{float: 'right'}}>Ctrl + D</Tag></span>}
            </Menu.Item>
            <Divider />
            <Menu.Item disabled={!AuthenticationStore.getRole()} key="delete" onClick={() => onDeleteFile([item])} danger>
                <FontAwesomeIcon icon={["fal", "trash"]} />
                {<span>{t("GENERAL.DELETE")}<Tag style={{float: 'right'}}>Delete</Tag></span>}
            </Menu.Item>
        </Menu>
    );

    const getSortedItems = () => {
        const folders = filter(selectedNode.children, (node) => node.type === "folder");
        const otherFiles = filter(selectedNode.children, (node) => node.type !== "folder");
        return [...sortBy(folders, (o) => o.title), ...sortBy(otherFiles, (o) => o.title)];
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="Drive_Folder_Preview" style={{ height: multipleFilesLoader.show ? "calc(100% - 38px)" : "100%" }}>
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                    }}
                    className="List_Container"
                    dataSource={getSortedItems()}
                    locale={{ emptyText: <Empty description={false} style={{ height: "30vh" }} /> }}
                    renderItem={(item) => (
                        <List.Item>
                            <Tooltip placement="bottom" title={t(item.notes)}>
                                <Dropdown
                                    overlay={item.type === "folder" ? driveItemFolderActions(item) : driveItemFileActions(item)}
                                    trigger={["contextMenu"]}
                                    onVisibleChange={() => onRightClick([item])}
                                >
                                    <Card
                                        className="Card_Preview"
                                        extra={
                                            <div className="Card_Header">
                                                {item.type === "loader" ? (
                                                    <div className="Card_Header_Loader" />
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
                                        }
                                    >
                                        <div
                                            onClick={(e) =>
                                                item.type === "loader" ||
                                                (item.status !== "converted" && item.status !== "conversion_failed" && item.type === "ifc") ||
                                                multipleFilesLoader.show
                                                    ? null
                                                    : selectionByClick(e, item)
                                            }
                                            className="Card_Body_Wrapper"
                                        >
                                            <div className="File_Icon">
                                                <FileIconSwitcher type={item.type} status={item.status} />
                                            </div>
                                            <div className="Card_Footer">
                                                {item.title ? (
                                                    <Typography.Paragraph ellipsis className="File_Title">
                                                        {item.title}
                                                    </Typography.Paragraph>
                                                ) : (
                                                    <p>&nbsp;</p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Dropdown>
                            </Tooltip>
                        </List.Item>
                    )}
                />
            </div>
            {multipleFilesLoader.show && (
                <UploadingDialog loaded={multipleFilesLoader.loaded} wanted={multipleFilesLoader.wanted} filesName={multipleFilesLoader.filesName} />
            )}
        </ErrorBoundary>
    );
};

export default FolderPreview;
