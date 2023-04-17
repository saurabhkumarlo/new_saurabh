import "./calculate-tree.less";

import { ClosablePopover, PopoverContent, SelectedTreeItems } from "./components";
import { CopyStore, EstimateStore, IfcStore, ObjectsStore, TreeStoreV2 } from "../../stores";
import { Dropdown, Menu, Tag, Tooltip, Tree } from "antd";
import { ErrorFallback, Modal, ReplaceRowsDialog, Status } from "../../components";
import { faExclamationCircle, faLock } from "@fortawesome/free-solid-svg-icons";
import { getPreventEditingAnnots, handleFolderChanged } from "./CalculateTree.utils";

import AnnotationActions from "./../../actions/AnnotationActions";
import AnnotationDeleteHandler from "./../../utils/AnnotationDeleteHandler";
import AnnotationStore from "../../stores/AnnotationStore";
import AuthenticationStore from "../../stores/AuthenticationStore";
import CalculationStore from "../../stores/CalculationStore";
import { ErrorBoundary } from "react-error-boundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Immutable from "immutable";
import React from "react";
import RowCopyStore from "./../../stores/RowCopyStore";
import ScaleStore from "../../stores/ScaleStore";
import { hex } from "wcag-contrast";
import { useTranslation } from "react-i18next";
import { get } from "lodash";
import { DeleteModal } from "calculate/calculate/components";

const VENTA_4 = "#c6cacd";
const CONTEXT_MENU_HEIGHT = 545;

class CalculateTree extends React.PureComponent {
    constructor() {
        super();
        this.deleteHandler = new AnnotationDeleteHandler();
        this.role = AuthenticationStore.getRole();
    }

    state = {
        checkedFilters: ["notStarted", "progress", "review", "complete"],
        popoverVisible: false,
        showReplaceConfirmation: false,
        height: window.innerHeight - 104,
        popoverPlacement: "bottomLeft",
        popoverOffset: 0,
        showPasteRowsDialog: false,
        deleteModalVisibile: false,
        contextVisible: false,
        showReplaceRowsConfirmation: false,
    };

    componentDidMount() {
        window.addEventListener("resize", this.updateHeight);
        this.unsubscribeAnnotaiotnStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeTreeStore = TreeStoreV2.listen(this.treeStoreUpdated);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateHeight);
        this.unsubscribeAnnotaiotnStore();
        this.unsubscribeTreeStore();
    }
    annotationStoreUpdated = (message) => {
        switch (message) {
            case "toggleDeleteModal":
                this.setState({ deleteModalVisibile: true });
                break;
            case "showReplaceRowsConfirmation":
                if (RowCopyStore.getCopyAnnotationRows().length > 0 && this.props.selectedAnnotations.length)
                    this.setState({ showReplaceRowsConfirmation: true });
                break;
            default:
                break;
        }
    };
    treeStoreUpdated = (message) => {
        switch (message) {
            case "checkedFiltersUpdated":
                this.setState({ checkedFilters: TreeStoreV2.getCheckedFilters() });
                break;
            case "popoverVisibleUpdated":
                this.setState({ popoverVisible: TreeStoreV2.getPopoverVisible() });
                break;
            default:
                break;
        }
    };

    updateHeight = () => {
        this.setState({ height: window.innerHeight - 104 });
    };
    onFolderChanged = ({ key }) => {
        this.toggleContextDropdown(false);
        handleFolderChanged({
            key,
            selectedAnnotations: this.props.selectedAnnotations,
            projectId: Number(this.props.match.params.projectId),
            onMovePreventEditingAnnots: this.props.onMovePreventEditingAnnots,
        });
    };
    getFolderItems = (list) => {
        const comparatorWithNrTag = (a, b) => {
            const title1 = a.number.concat(" ", a.title);
            const title2 = b.number.concat(" ", b.title);
            return title1.toString().localeCompare(title2.toString(), "en", { numeric: true });
        };
        const comparatorWithoutNrTag = (a, b) => {
            const title1 = a.title;
            const title2 = b.title;
            return title1.toString().localeCompare(title2.toString(), "en", { numeric: true });
        };
        const sortedList = [...list.filter((e) => !e.number).sort(comparatorWithoutNrTag), ...list.filter((e) => e.number).sort(comparatorWithNrTag)];

        return sortedList.map((folder) => {
            const title =
                folder.key === "root" && EstimateStore.getActiveEstimate().name
                    ? EstimateStore.getActiveEstimate().name
                    : "".concat(folder.number || "", " ", folder.title);
            const key = folder.key === "root" ? folder.key : folder.id;
            if (folder.children) {
                return (
                    <Menu.SubMenu onTitleClick={this.onFolderChanged} key={key} title={title} popupClassName="ContextMenu_SubMenu">
                        {this.getFolderItems(folder.children)}
                    </Menu.SubMenu>
                );
            } else {
                return (
                    <Menu.Item onClick={this.onFolderChanged} key={folder.id}>
                        {title}
                    </Menu.Item>
                );
            }
        });
    };

    removeReadOnlyAnnotations() {
        let selectedAnnotations = new Immutable.List();
        if (AnnotationStore.isActiveIfcFile()) return this.props.selectedAnnotations;
        this.props.selectedAnnotations.forEach((annot) => {
            const parser = new DOMParser();
            const xfdfElements = parser.parseFromString(annot.get("xfdf"), "text/xml");
            if (annot.get("type") !== "group") {
                const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                if (annotElement.getAttribute("readOnly") !== "true") {
                    selectedAnnotations = selectedAnnotations.push(annot);
                }
            } else {
                selectedAnnotations = selectedAnnotations.push(annot);
            }
        });

        return selectedAnnotations;
    }

    onDoubleClick = (_, data) => {
        localStorage.setItem(`expandedKeys_${this.props.projectId}`, JSON.stringify(TreeStoreV2.getTreeExpansion()));
        if (data.data.annotationId) {
            localStorage.setItem(`selectedAnnotation_${this.props.projectId}`, JSON.stringify({ key: data.data.id, annotId: data.data.annotationId }));
            AnnotationStore.jumpToAnnotation(data.data.annotationId, false);
            if (AnnotationStore.getActiveFileId() !== data.data.geoFile.id) {
                this.redirectToFile(data.data);
            }
        }
    };

    onDrop = (data) => {
        TreeStoreV2.onDrop(this.props.selectedAnnotations, data);
    };

    toggleFilters = (filter) => {
        const { checkedFilters } = this.state;
        checkedFilters.includes(filter)
            ? this.setState({ checkedFilters: checkedFilters.filter((item) => item !== filter) })
            : this.setState({ checkedFilters: [...checkedFilters, filter] });
    };

    clearFilters = () => {
        this.setState({ checkedFilters: ["notStarted", "progress", "review", "complete"], popoverVisible: false });
    };

    togglePopover = (visibility) => {
        if (visibility) {
            this.setState({ popoverVisible: true });
        } else {
            this.clearFilters();
        }
    };

    getTreeTitleTagColor = (backgroundColor) => (hex(backgroundColor, "#000") > 6.5 ? "#000" : "#fff");

    isLocked = (item) => {
        if (item.data.type === "3DModel") {
            const parsedXfdf = item.data.xfdf;
            return parsedXfdf?.readOnly;
        } else {
            const parser = new DOMParser();
            const xfdfElements = parser.parseFromString(item.data.xfdf, "text/xml");
            const annotElement = xfdfElements.querySelector("annots").firstElementChild;
            return annotElement && annotElement.getAttribute("readOnly") === "true";
        }
    };

    checkIsFolderChild = (currentItem) => {
        //rework
        //const selectedChildren = AnnotationStore.getSelectedChildren();
        //return selectedChildren.some((item) => item.id === currentItem.key);
        return false;
    };

    redirectToFile = (annotation) => {
        const projectId = AnnotationStore.getProjectIdFromEstimateId(annotation.geoEstimate.id);
        if (annotation.type !== "folder") {
            this.props.history.push("/projects/" + projectId + "/calculate/" + annotation.geoFile.id);
            window.location.reload();
        }
    };

    getItemTitle = (annotation) => {
        const {
            data: { type },
            countedObjects,
            title,
        } = annotation;

        switch (type) {
            case "group":
                return `[${countedObjects}] ${title}`;
            case "Polygon":
                return countedObjects > 0 ? `[${countedObjects}] ${title}` : title;
            default:
                return title;
        }
    };

    renderTreeItem = (item) => {
        const labelBackgroundColor =
            item.data.type === "Polyline" || item.data.type === "Arrow"
                ? item.data.color
                : item.data.type === "3DModel"
                ? item.data.xfdf.color
                : item.data.interiorColor;
        const borderColor = item.data.type === "3DModel" ? item.data.xfdf.color : item.data.type === "Free text" ? item.data.strokeColor : item.data.color;
        const activeAnnot = this.isActiveAnnotation(item);
        const isEstimatelocked = get(AnnotationStore.ActiveEstimate?.toJS(), "locked");
        const isAnnotLocked = (item.data.type !== "group" && this.isLocked(item)) || isEstimatelocked;
        const itemStatus = item.data.type !== "group" && item.data.type === "3DModel" ? item.data.xfdf.status : item.data.status;
        const isSelectedAsChild = this.checkIsFolderChild(item);

        return (
            <div
                id={`treeList_${item.data.id}`}
                className={"Tree_Title_Item"}
                data-cy={`calculate-tree_${item.title ? item.title.toLowerCase().replaceAll(" ", "-") : ""}--item`}
            >
                {CalculationStore.hasRows(item.data.id) && <FontAwesomeIcon className="Tree_Title_Elipsis_Icon" icon={["fal", "ellipsis-h"]} />}
                {isAnnotLocked && <FontAwesomeIcon className="Tree_Title_Lock_Icon" icon={faLock} />}
                <label className={activeAnnot ? (isSelectedAsChild ? "Italic" : "") : "Inactive"}>{this.getItemTitle(item)}</label>
                {item.hasNegativeRow && (
                    <FontAwesomeIcon
                        className="Tree_Title_Exclamation_Circle_Icon"
                        icon={item.data.type === "group" ? ["fal", "exclamation-circle"] : faExclamationCircle}
                    />
                )}

                {item.data.number && (
                    <div
                        className="Tree_Title_Tag"
                        style={{
                            backgroundColor: item.data.type === "group" ? VENTA_4 : labelBackgroundColor,
                            color: this.getTreeTitleTagColor(item.data.type === "group" ? VENTA_4 : labelBackgroundColor || "#fff"),
                            border: !["Polyline", "Point", "group"].includes(item.data.type)
                                ? `2px solid ${borderColor}`
                                : `2px solid ${item.data.type === "group" ? VENTA_4 : labelBackgroundColor}`,
                        }}
                    >
                        <label style={{ color: this.getTreeTitleTagColor(item.data.type === "group" ? VENTA_4 : labelBackgroundColor || "#fff") }}>
                            {item.data.number}
                        </label>
                    </div>
                )}
                {(item.data.type === "group" || item.data.type === "Polygon") && Object.values(item.statuses).some((x) => x > 0) && (
                    <ClosablePopover
                        content={<PopoverContent annotation={item} checkedFilters={this.state.checkedFilters} toggleCurrentFilters={this.toggleFilters} />}
                        trigger="click"
                        placement="right"
                        onVisibleChange={this.togglePopover}
                        isActiveAnnotation={true}
                        clearFilters={this.clearFilters}
                    >
                        <div className="Tree_Title_Statuses Tree_Title_Statuses_TreeStatuses">
                            <Status
                                notStarted={item.statuses.notStarted > 0}
                                progress={item.statuses.progress > 0}
                                review={item.statuses.review > 0}
                                complete={item.statuses.complete > 0}
                            />
                        </div>
                    </ClosablePopover>
                )}
                {item.data.type !== "group" && item.data.type !== "Polygon" && (
                    <ClosablePopover
                        content={<PopoverContent annotation={item} checkedFilters={this.state.checkedFilters} toggleCurrentFilters={this.toggleFilters} />}
                        trigger="click"
                        placement="right"
                        onVisibleChange={this.togglePopover}
                        isActiveAnnotation={true}
                        clearFilters={this.clearFilters}
                    >
                        <div className="Tree_Title_Statuses Tree_Title_Statuses_TreeStatuses">
                            <Status
                                notStarted={itemStatus === "notStarted" || !itemStatus}
                                progress={itemStatus === "progress"}
                                review={itemStatus === "review"}
                                complete={itemStatus === "complete"}
                            />
                        </div>
                    </ClosablePopover>
                )}
            </div>
        );
    };

    handleCopyAnnotationClick = () => {
        AnnotationStore.copyAnnotations();
        this.closeContextDropdown();
    };

    handlePasteAnnotationClick = () => {
        AnnotationStore.pasteAnnotations();
        this.closeContextDropdown();
    };

    filterObjects = (array) => {
        const { checkedFilters } = this.state;
        const getNodes = (result, object) => {
            checkedFilters.forEach((item) => {
                if (object.data.type === "3DModel" && object.data.xfdf.status === item) {
                    result.push(object);
                    return result;
                }
                if (object.data.status === item && !object.folder) {
                    result.push(object);
                    return result;
                }
                if (object.data.status === item && object.data.type === "Polygon" && !object.children) {
                    result.push(object);
                    return result;
                }
                if (object.data.status === item && object.data.type === "Polygon" && object.children) {
                    const children = object.children.reduce(getNodes, []);
                    result.push({ ...object, children });
                    return result;
                }
            });
            if (Array.isArray(object.children) && object.data.type !== "Polygon") {
                const children = object.children.reduce(getNodes, []);
                if (children.length) result.push({ ...object, children });
            }
            return result;
        };
        return array.reduce(getNodes, []);
    };

    onExpand = (keys) => {
        localStorage.setItem(`expandedKeys_${this.props.projectId}`, JSON.stringify(keys));
        TreeStoreV2.setTreeExpansion(keys);
    };

    selectAnnotToRightClick = (data) => {
        if (this.props.selectedAnnotations.length) {
            const isAnnotSelected = this.props.selectedAnnotations.some((item) => item.id === data.node.key);
            if (!isAnnotSelected) TreeStoreV2.calculateTreeCheck([data.node.key], { ...data, selectedNodes: [data.node] });
        } else {
            TreeStoreV2.calculateTreeCheck([data.node.key], { ...data, selectedNodes: [data.node] });
        }
    };

    onCalculateTreeSelect = async (selectedKeys, data, ifcData) => {
        const dataForIfc = ifcData ? ifcData : data;
        if (dataForIfc.node && AnnotationStore.isActiveIfcFile()) {
            if (dataForIfc.node.data.type !== "group") {
                const { uuid } = dataForIfc.node.data.xfdf;
                const { icon, title } = dataForIfc.node;
                const currentData = {
                    node: { icon: icon, id: uuid, key: uuid, title: title },
                };
                const fileId = dataForIfc.node.data.geoFile.id;
                IfcStore.setSelectedObjectFromTree([uuid], currentData, fileId);
            }
        }
        TreeStoreV2.calculateTreeCheck(selectedKeys, data);
        ObjectsStore.selectScale({ scaleType: null });
        if (this.state.popoverVisible) {
            this.onExpand(this.props.expandedKeys.concat(selectedKeys));
        }
    };

    isCopyHandlerButtonDisabled = () => {
        if (RowCopyStore.getCopyAnnotationRows().length === 0) return true;
        else if (this.props.selectedAnnotations.length === 0) return true;
        else return false;
    };

    isPasteAnnotationButtonDisabled = () => {
        if (AnnotationStore.getCopiedAnnotation().length === 0) return true;
        else return false;
    };

    isPastePropertiesButtonDisabled = () => {
        if (CopyStore.getPropertiecCopy().size === 0) return true;
        else if (this.props.selectedAnnotations.length === 0) return true;
        else return false;
    };

    isPasteStylesButtonDisabled = () => {
        if (CopyStore.getStylesCopy().size === 0) return true;
        else if (this.props.selectedAnnotations.length === 0) return true;
        else return false;
    };

    checkIfNodeIsReadOnly = (annot) => {
        if (AnnotationStore.isActiveIfcFile()) return "false";
        if (annot.first().get("type") === "group") return "false";
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(annot.first().get("xfdf"), "text/xml");
        const annotElement = xfdfElements.querySelector("annots").firstElementChild;
        if (!annotElement.getAttribute("readOnly")) return "false";
        return annotElement.getAttribute("readOnly");
    };
    deleteNodesHandler = (annotsToDelete) => {
        if (annotsToDelete.size > 1) {
            this.setState({ deleteModalVisibile: true });
            this.closeContextDropdown();
            return;
        }
        if (annotsToDelete.size === 0 || annotsToDelete.toJS()[0].id === -1) {
            this.closeContextDropdown();
            return;
        }
        const isFolderSelected = annotsToDelete.first().getIn(["type"]) === "group";
        if (isFolderSelected) this.deleteHandler.deleteAnnotations(annotsToDelete);
        else if (this.checkIfNodeIsReadOnly(annotsToDelete) === "false") this.deleteHandler.deleteAnnotations(annotsToDelete);
        this.closeContextDropdown();
    };

    isActiveAnnotation = (item) => {
        if (item) {
            if (item.data.type === "group") return true;
            else return AnnotationStore.getActiveFileId() === item.data.geoFile.id;
        }
        return false;
    };

    checkOnDrag = (e) => {
        const data = { selectedNodes: [e.node], node: e.node };
        if (this.props.selectedKeys.length > 0) {
            const checkCurrentItem = this.props.selectedKeys.find((item) => e.node.key === item);
            if (!checkCurrentItem) {
                this.onCalculateTreeSelect([e.node.key], data, e);
                return;
            }
            return;
        }
        this.onCalculateTreeSelect([e.node.key], data, e);
    };

    onRightClick = (e) => {
        if (e.target.className === "ant-tree-list") {
            ObjectsStore.clearSelection();
        }
        const placeMenuOnBottom = window.innerHeight / 2 > e.pageY;
        const contexMenuOffset = placeMenuOnBottom ? window.innerHeight - e.pageY - CONTEXT_MENU_HEIGHT : e.pageY - CONTEXT_MENU_HEIGHT;
        const offsetCssProperty = contexMenuOffset < 0 ? `${placeMenuOnBottom ? -contexMenuOffset : contexMenuOffset}px` : "100%";

        this.setState({
            popoverPlacement: placeMenuOnBottom ? "bottomLeft" : "topLeft",
            popoverOffset: offsetCssProperty,
        });
    };
    submitPasteRows = () => {
        RowCopyStore.pasteAnnotationRows(this.props.selectedAnnotations);
        this.setState({ showPasteRowsDialog: false });
    };
    onDropHandler = (selectedAnnots, data) => {
        const annotsToCheck = selectedAnnots.filter((annot) => annot.type !== "group");
        const prevetnEditingAnnots = getPreventEditingAnnots(annotsToCheck);
        if (prevetnEditingAnnots.length > 0) {
            this.props.onMovePreventEditingAnnots(Immutable.fromJS(prevetnEditingAnnots));
            return;
        }
        TreeStoreV2.onDrop(selectedAnnots, data);
    };
    deleteAnnotationHandler = () => {
        this.deleteHandler.deleteAnnotations(AnnotationStore.getAnnotationsLists().readWriteList);
        this.setState({ deleteModalVisibile: false });
        TreeStoreV2.clearSelectedAnnotations();
        AnnotationStore.onSetActiveParentId(undefined, true);
    };

    toggleContextDropdown = (e) => {
        this.setState({ contextVisible: e });
    };

    closeContextDropdown = () => {
        this.setState({
            contextVisible: false,
        });
    };

    onReplaceRows = () => {
        RowCopyStore.replaceAnnotationRows(this.props.selectedAnnotations);
        this.setState({ showReplaceRowsConfirmation: false });
        this.closeContextDropdown();
    };

    onCancelReplaceRows = () => {
        this.setState({ showReplaceRowsConfirmation: false });
        this.closeContextDropdown();
    };
    onOpenReplaceRows = () => {
        this.setState({ showReplaceRowsConfirmation: true });
        this.closeContextDropdown();
    };

    filterObjects = (array) => {
        const { checkedFilters } = this.state;
        const getNodes = (result, object) => {
            checkedFilters.forEach((item) => {
                if (object.data.type === "3DModel" && object.data.xfdf.status === item) {
                    result.push(object);
                    return result;
                }
                if (object.data.status === item && !object.folder) {
                    result.push(object);
                    return result;
                }
                if (object.data.status === item && object.data.type === "Polygon" && !object.children) {
                    result.push(object);
                    return result;
                }
                if (object.data.status === item && object.data.type === "Polygon" && object.children) {
                    const children = object.children.reduce(getNodes, []);
                    result.push({ ...object, children });
                    return result;
                }
            });
            if (Array.isArray(object.children) && object.data.type !== "Polygon") {
                const children = object.children.reduce(getNodes, []);
                if (children.length) result.push({ ...object, children });
            }
            return result;
        };
        return array.reduce(getNodes, []);
    };

    render() {
        const { t } = this.props;
        const SELECTED_ITEMS_COMPONENT_HEIGHT = 30;
        const isEstimateLocked = get(AnnotationStore.ActiveEstimate?.toJS(), "locked");

        const calculateTreeMenu = (
            <Menu
                className="Calculate_Rows_ContextMenu"
                style={
                    this.state.popoverPlacement === "topLeft"
                        ? { position: "absolute", bottom: this.state.popoverOffset, width: "320px" }
                        : { bottom: this.state.popoverOffset, width: "320px" }
                }
            >
                <Menu.Item
                    onClick={() => {
                        AnnotationActions.requestAnnotationFolderCreate("Folder");
                        this.closeContextDropdown();
                    }}
                >
                    {t("GENERAL.ADD_FOLDER")}
                    <Tag style={{ float: "right" }}>Ctrl + Alt + N</Tag>
                </Menu.Item>
                <Menu.Divider />

                <Menu.SubMenu
                    title={t("GENERAL.MOVE")}
                    popupClassName="ContextMenu_SubMenu"
                    disabled={this.props.selectedAnnotations.length === 0 || AnnotationStore.isActiveIfcFile()}
                >
                    {this.getFolderItems(AnnotationStore.getMoveFolderTree())}
                </Menu.SubMenu>

                <Tooltip placement="right" title={t("GENERAL.TOOLTIP.COPY")}>
                    <Menu.Item
                        onClick={this.handleCopyAnnotationClick}
                        disabled={this.props.selectedAnnotations.length === 0 || AnnotationStore.isActiveIfcFile()}
                    >
                        {t("GENERAL.COPY")}
                        <Tag style={{ float: "right" }}>Ctrl + C</Tag>
                    </Menu.Item>
                </Tooltip>
                <Tooltip placement="right" title={t("GENERAL.TOOLTIP.PASTE")}>
                    <Menu.Item onClick={this.handlePasteAnnotationClick} disabled={this.isPasteAnnotationButtonDisabled() || AnnotationStore.isActiveIfcFile()}>
                        {t("GENERAL.PASTE")}
                        <Tag style={{ float: "right" }}>Ctrl + V</Tag>
                    </Menu.Item>
                </Tooltip>
                <Menu.Divider />
                <Tooltip placement="right" title={t("GENERAL.TOOLTIP.COPY_PROPERTIES")}>
                    <Menu.Item
                        onClick={() => {
                            CopyStore.copyAnnotationProperties();
                            this.closeContextDropdown();
                        }}
                        disabled={this.props.selectedAnnotations.length !== 1 || AnnotationStore.isActiveIfcFile()}
                    >
                        {t("GENERAL.COPY_PROPERTIES")}
                        <Tag style={{ float: "right" }}>Ctrl + Shift + Alt + C</Tag>
                    </Menu.Item>
                </Tooltip>
                <Tooltip placement="right" title={t("GENERAL.TOOLTIP.PASTE_PROPERTIES")}>
                    <Menu.Item
                        onClick={() => {
                            CopyStore.pasteAnnotationProperties(this.props.selectedAnnotations);
                            this.closeContextDropdown();
                        }}
                        disabled={this.isPastePropertiesButtonDisabled() || AnnotationStore.isActiveIfcFile()}
                    >
                        {t("GENERAL.PASTE_PROPERTIES")}
                        <Tag style={{ float: "right" }}> Ctrl + Shift + Alt + V</Tag>
                    </Menu.Item>
                </Tooltip>
                <Menu.Divider />
                <Tooltip placement="right" title={t("GENERAL.TOOLTIP.COPY_STYLES")}>
                    <Menu.Item
                        disabled={this.props.selectedAnnotations.length !== 1}
                        onClick={() => {
                            CopyStore.copyAnnotationStyles();
                            this.closeContextDropdown();
                        }}
                    >
                        {t("GENERAL.COPY_STYLES")}
                        <Tag style={{ float: "right" }}> Ctrl + Alt + C</Tag>
                    </Menu.Item>
                </Tooltip>
                <Tooltip placement="right" title={t("GENERAL.TOOLTIP.PASTE_STYLES")}>
                    <Menu.Item
                        disabled={this.isPasteStylesButtonDisabled()}
                        onClick={() => {
                            CopyStore.pasteAnnotationStyles(this.props.selectedAnnotations);
                            this.closeContextDropdown();
                        }}
                    >
                        {t("GENERAL.PASTE_STYLES")}
                        <Tag style={{ float: "right" }}>Ctrl + Alt + V</Tag>
                    </Menu.Item>
                </Tooltip>
                <Menu.Divider />

                <Menu.Item
                    onClick={() => {
                        RowCopyStore.copyAnnotationRows(this.props.selectedAnnotations);
                        this.closeContextDropdown();
                    }}
                    disabled={this.props.selectedAnnotations.length === 0}
                >
                    {t("GENERAL.COPY_ROWS")}
                    <Tag style={{ float: "right" }}>Ctrl + Shift + C</Tag>
                </Menu.Item>

                <Menu.Item
                    onClick={() => {
                        if (this.props.selectedAnnotations.length > 1) {
                            this.setState({ showPasteRowsDialog: true });
                        } else {
                            RowCopyStore.pasteAnnotationRows(this.props.selectedAnnotations);
                        }
                        this.closeContextDropdown();
                    }}
                    disabled={this.isCopyHandlerButtonDisabled()}
                >
                    {t("GENERAL.PASTE_ROWS")}
                    <Tag style={{ float: "right" }}>Ctrl + Shift + V</Tag>
                </Menu.Item>
                <Menu.Item disabled={this.isCopyHandlerButtonDisabled()} onClick={this.state.onOpenReplaceRows}>
                    {t("GENERAL.REPLACE_ROWS")}
                    <Tag style={{ float: "right" }}>Ctrl + Shift + D</Tag>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    onClick={() => {
                        this.setState({ deleteModalVisibile: true });
                        this.closeContextDropdown();
                    }}
                    disabled={this.props.selectedAnnotations.length === 0}
                    danger
                >
                    {t("GENERAL.DELETE")}
                    <Tag style={{ float: "right" }}>Delete</Tag>
                </Menu.Item>
                <Menu.Divider />
                <Menu.ItemGroup>
                    {this.props.selectedKeys.length === 1
                        ? t("GENERAL.SELECTED_OBJECT", { count: this.props.selectedKeys.length })
                        : t("GENERAL.SELECTED_OBJECTS", { count: this.props.selectedKeys.length })}
                </Menu.ItemGroup>
            </Menu>
        );

        return (
            <>
                {this.state.deleteModalVisibile && (
                    <DeleteModal
                        visible={this.state.deleteModalVisibile}
                        annotationLists={AnnotationStore.getAnnotationsLists()}
                        onCancel={() => this.setState({ deleteModalVisibile: false })}
                        onAccept={this.deleteAnnotationHandler}
                    />
                )}
                {this.state.showPasteRowsDialog && (
                    <Modal
                        visible={this.state.showPasteRowsDialog}
                        title={t("GENERAL.ADD_ROWS_TO_MULTIPLE_OBJECTS")}
                        submitButtonTitle={t("GENERAL.ADD_ROWS")}
                        onOk={this.submitPasteRows}
                        onPressEnter={this.submitPasteRows}
                        onCancel={() => this.setState({ showPasteRowsDialog: false })}
                        width={284}
                    >
                        <p>{t("GENERAL.ADD_ROWS_TO_MULTIPLE OBJECTS_MESSAGE")}</p>
                    </Modal>
                )}
                {this.state.showReplaceRowsConfirmation && (
                    <Modal
                        visible={this.state.showReplaceRowsConfirmation}
                        title={this.props.t("GENERAL.REPLACE_ROWS_IN_CURRENT_SELECTION")}
                        onOk={this.onReplaceRows}
                        onCancel={this.onCancelReplaceRows}
                        submitButtonTitle={this.props.t("GENERAL.REPLACE")}
                        className="Calculate_Modal"
                    >
                        <ReplaceRowsDialog
                            oldData={RowCopyStore.getAllAnnotationRows(this.state.selectedAnnotations)}
                            newData={RowCopyStore.getCopyAnnotationRows()}
                        />
                    </Modal>
                )}
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <div
                        onContextMenu={this.onRightClick}
                        style={{ height: this.props.selectedKeys.length === 0 ? this.state.height : this.state.height - SELECTED_ITEMS_COMPONENT_HEIGHT }}
                    >
                        <Dropdown
                            trigger={this.role && !isEstimateLocked ? ["contextMenu"] : []}
                            overlay={calculateTreeMenu}
                            placement={this.state.popoverPlacement}
                            visible={this.state.contextVisible}
                            onVisibleChange={this.toggleContextDropdown}
                            overlayStyle={{ height: "100%" }}
                        >
                            <Tree.DirectoryTree
                                className="Tree"
                                treeData={this.state.popoverVisible ? this.filterObjects(this.props.treeData) : this.props.treeData}
                                titleRender={this.renderTreeItem}
                                defaultExpandAll
                                onSelect={this.onCalculateTreeSelect}
                                selectedKeys={this.props.selectedKeys || []}
                                showLine={{ showLeafIcon: false }}
                                disabled
                                multiple
                                onRightClick={this.selectAnnotToRightClick}
                                expandedKeys={this.props.expandedKeys}
                                onExpand={this.onExpand}
                                expandAction={"doubleClick"}
                                ref={this.props.forwardedRef}
                                draggable={this.role}
                                onDragStart={(e) => this.checkOnDrag(e)}
                                onDrop={(data) => this.onDropHandler(this.props.selectedAnnotations, data)}
                                draggable={({ data }) => data.type !== "Reduction" && this.role && !isEstimateLocked}
                                onDoubleClick={this.onDoubleClick}
                                height={this.props.selectedKeys.length === 0 ? this.state.height : this.state.height - SELECTED_ITEMS_COMPONENT_HEIGHT}
                            />
                        </Dropdown>
                    </div>
                </ErrorBoundary>
                {this.props.selectedKeys.length > 0 && <SelectedTreeItems selectedKeys={this.props.selectedKeys} />}
            </>
        );
    }
}

export default React.forwardRef((props, ref) => {
    const { t } = useTranslation();
    return <CalculateTree {...props} forwardedRef={ref} t={t} />;
});
