import "./drivetoolbar.less";

import { Button, Dropdown, Input, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";

import { BIMerToolbar } from "../../../components/BIMer";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../../components";
import FileStore from "../../../stores/FileStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Submenu } from "./components";
import { get } from "lodash";
import { useTranslation } from "react-i18next";

const DriveToolbar = ({
    role,
    selectedNode,
    onDelete,
    onDownloadFile,
    activePage,
    pageCount,
    onUpdatePage,
    onOpenInCalculate,
    checkedItems,
    selectedItem,
    viewerRef,
    templateModalVisible,
    showSubmenu,
    switchShowSubmenu,
    openFolderModal,
    openUploadModal,
    allKeysExpanded,
    expandAll,
    collapseAll,
    toolNode,
    onChangeTool,
}) => {
    const [isFolderPreview, setIsFolderPreview] = useState(false);
    const [isIfcPreview, setIsIfcPreview] = useState(false);
    const [isPdfPreview, setIsPdfPreview] = useState(false);
    const selectedNodeType = get(selectedNode, "type");
    const { t } = useTranslation();

    useEffect(() => {
        setIsFolderPreview(selectedNodeType === "folder");
        setIsIfcPreview(selectedNodeType === "ifc");
        setIsPdfPreview(selectedNodeType && selectedNodeType !== "folder" && selectedNodeType !== "ifc");
    }, [selectedNode]);

    const pageForward = () => {
        FileStore.webViewer.goToNextPage();
        onUpdatePage(FileStore.webViewer.getCurrentPageNumber(), FileStore.webViewer.getPageCount());
    };

    const pageBack = () => {
        FileStore.webViewer.goToPrevPage();
        onUpdatePage(FileStore.webViewer.getCurrentPageNumber(), FileStore.webViewer.getPageCount());
    };

    const selectPage = (e) => {
        const page = parseInt(e.target.value || "1", 10);
        FileStore.webViewer.setCurrentPageNumber(page);
        onUpdatePage(FileStore.webViewer.getCurrentPageNumber(), FileStore.webViewer.getPageCount());
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="Toolbar Drive_Toolbar">
                {isIfcPreview && <BIMerToolbar viewerRef={viewerRef} selectedNode={selectedNode} onDownloadFile={onDownloadFile} />}
                {isFolderPreview && (
                    <>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.ADD_FOLDER")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + Alt + N</Tag>
                                </span>
                            }
                        >
                            <Button disabled={!role} onClick={openFolderModal} icon={<FontAwesomeIcon icon={["fal", "folder-plus"]} />} />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.UPLOAD")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + U</Tag>
                                </span>
                            }
                        >
                            <Button disabled={!role} onClick={openUploadModal} icon={<FontAwesomeIcon icon={["fal", "cloud-upload"]} />} />
                        </Tooltip>
                        <Divider />
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.DELETE")}
                                    <br />
                                    <br />
                                    <Tag>Delete</Tag>
                                </span>
                            }
                        >
                            <Button
                                onClick={onDelete}
                                disabled={checkedItems.length !== 1 || (checkedItems.length === 1 && checkedItems[0].parentId === null) || !role}
                                icon={<FontAwesomeIcon icon={["fal", "trash"]} />}
                            />
                        </Tooltip>
                    </>
                )}
                {isPdfPreview && (
                    <>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.SELECT")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + Alt + N</Tag>
                                </span>
                            }
                        >
                            <Button
                                onClick={() => onChangeTool("AnnotationEdit")}
                                icon={<FontAwesomeIcon icon={["fal", "mouse-pointer"]} />}
                                className={toolNode === "AnnotationEdit" ? "Toolbar_Button--active" : null}
                            />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.PAN")}
                                    <br />
                                    <br />
                                    <Tag>{t("KEY.SPACE")}</Tag>
                                </span>
                            }
                        >
                            <Button
                                onClick={() => onChangeTool("Pan")}
                                icon={<FontAwesomeIcon icon={["fal", "arrows"]} />}
                                className={toolNode === "Pan" ? "Toolbar_Button--active" : null}
                            />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.ZOOM_SELECTION")}
                                    <br />
                                    <br />
                                    <Tag>Alt + Z</Tag>
                                </span>
                            }
                        >
                            <Button
                                onClick={() => onChangeTool("MarqueeZoomTool")}
                                icon={<FontAwesomeIcon icon={["fal", "search"]} />}
                                className={toolNode === "MarqueeZoomTool" ? "Toolbar_Button--active" : null}
                            />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.FIT_TO_SCREEN")}
                                    <br />
                                    <br />
                                    <Tag>Alt + 0</Tag>
                                </span>
                            }
                        >
                            <Button onClick={() => FileStore.setFitToScreen()} icon={<FontAwesomeIcon icon={["fal", "expand"]} />} />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.PREVIOUS_PAGE")}
                                    <br />
                                    <br />
                                    <Tag>Page Up</Tag>
                                </span>
                            }
                        >
                            <Button onClick={pageBack} icon={<FontAwesomeIcon icon={["fal", "angle-left"]} />} disabled={activePage <= 1 || pageCount === 1} />
                        </Tooltip>
                        <Input
                            id="pageInput"
                            value={activePage}
                            addonAfter={pageCount ? "/ " + pageCount : ""}
                            onFocus={() => document.activeElement.select()}
                            className="PageInputGroup"
                            onChange={selectPage}
                            onBlur={(e) => selectPage(e, true)}
                        />
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.NEXT_PAGE")}
                                    <br />
                                    <br />
                                    <Tag>Page Down</Tag>
                                </span>
                            }
                        >
                            <Button onClick={pageForward} icon={<FontAwesomeIcon icon={["fal", "angle-right"]} />} disabled={activePage >= pageCount} />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.OPEN")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + O</Tag>
                                </span>
                            }
                        >
                            <Button onClick={() => onOpenInCalculate(selectedItem)} icon={<FontAwesomeIcon icon={["fal", "external-link-square"]} />} />
                        </Tooltip>
                        <Tooltip placement="bottom" title={<span>{t("GENERAL.OPEN_IN_NEW_TAB")}</span>}>
                            <Button onClick={() => onOpenInCalculate(selectedItem, true)} icon={<FontAwesomeIcon icon={["fal", "external-link"]} />} />
                        </Tooltip>
                        <Divider />
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.DOWNLOAD")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + D</Tag>
                                </span>
                            }
                        >
                            <Button onClick={onDownloadFile} icon={<FontAwesomeIcon icon={["fal", "cloud-download"]} />} />
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            title={
                                <span>
                                    {t("GENERAL.DELETE")}
                                    <br />
                                    <br />
                                    <Tag>Delete</Tag>
                                </span>
                            }
                        >
                            <Button
                                onClick={onDelete}
                                disabled={checkedItems.length !== 1 || (checkedItems.length === 1 && checkedItems[0].parentId === null) || !role}
                                icon={<FontAwesomeIcon icon={["fal", "trash"]} />}
                            />
                        </Tooltip>
                    </>
                )}
                <Dropdown
                    className="Drive_MoreMenu"
                    overlay={
                        <Submenu
                            templateModalVisible={templateModalVisible}
                            switchShowSubmenu={switchShowSubmenu}
                            allKeysExpanded={allKeysExpanded}
                            expandAll={expandAll}
                            collapseAll={collapseAll}
                        />
                    }
                    trigger={["click"]}
                    visible={showSubmenu}
                    onVisibleChange={switchShowSubmenu}
                >
                    <Button icon={<FontAwesomeIcon icon={["fal", "ellipsis-v-alt"]} />} />
                </Dropdown>
            </div>
        </ErrorBoundary>
    );
};

const Divider = () => {
    return <span className="Bimer_Divider" />;
};

export default DriveToolbar;
