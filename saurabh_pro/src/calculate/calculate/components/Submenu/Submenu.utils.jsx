import { AnnotationStore, AuthenticationStore, ProjectsStore, TemplatesStore, TreeStoreV2 } from "../../../../stores";
import { Checkbox, Divider, Menu, Radio, Tag } from "antd";
import { SettingOutlined, UndoOutlined } from "@ant-design/icons/lib/icons";
import { markerTypes, sideLabelsTypes } from "constants/LabelsConstants";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MessageHandlerV2Actions } from "../../../../actions";
import React from "react";
import { map } from "lodash";
import { useTranslation } from "react-i18next";

const deselectAll = () => TreeStoreV2.clearSelectedAnnotations();

const filterMenuItems = [
    {
        key: "type-number-name",
        label: "ESTIMATE.FILTER.TYPE_NR_NAME_DEFAULT",
    },
    {
        key: "type-name-number",
        label: "ESTIMATE.FILTER.TYPE_NAME_NR",
    },
    {
        key: "number-type-name",
        label: "ESTIMATE.FILTER.NR_TYPE_NAME",
    },
    {
        key: "name-number-type",
        label: "ESTIMATE.FILTER.NAME_NR_TYPE",
    },
    {
        key: "name-type-number",
        label: "ESTIMATE.FILTER.NAME_TYPE_NR",
    },
    {
        key: "type-number",
        label: "ESTIMATE.FILTER.TYPE_NR",
    },
    {
        key: "type-name",
        label: "ESTIMATE.FILTER.TYPE_NAME",
    },
    {
        key: "number-type",
        label: "ESTIMATE.FILTER.NR_TYPE",
    },
    {
        key: "number-name",
        label: "ESTIMATE.FILTER.NR_NAME",
    },
    {
        key: "name-type",
        label: "ESTIMATE.FILTER.NAME_TYPE",
    },
    {
        key: "name-number",
        label: "ESTIMATE.FILTER.NAME_NR",
    },
    {
        key: "type",
        label: "ESTIMATE.FILTER.TYPE",
    },
    {
        key: "number",
        label: "ESTIMATE.FILTER.NR",
    },
    {
        key: "name",
        label: "ESTIMATE.FILTER.NAME",
    },
    {
        key: "status",
        label: "Status",
    },
];

const FilterMenu = (changeTreeSorting, treeSorting) => {
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu">
            <Radio.Group onChange={changeTreeSorting} value={treeSorting}>
                {map(filterMenuItems, (item) => (
                    <Radio key={item.key} onChange={changeTreeSorting} value={item.key} className="InnerToolbar_SubmenuRadio">
                        {t(item.label)}
                    </Radio>
                ))}
            </Radio.Group>
        </Menu>
    );
};

const LabelsMenu = (onChange, value, data) => {
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu">
            <Radio.Group onChange={onChange} value={value}>
                {map(data, (item) => (
                    <Radio key={item.key} onChange={onChange} value={item.key} className="InnerToolbar_SubmenuRadio">
                        {t(item.label)}
                    </Radio>
                ))}
            </Radio.Group>
        </Menu>
    );
};

const setPageLayout = (e) => {
    localStorage.setItem("calculatePageLayout", e.target.value);
    AnnotationStore.setDisplayMode(e.target.value);
};

const setSnapMode = (e) => {
    localStorage.setItem("snapMode", e.target.value);
    AnnotationStore.setSnapMode(e.target.value);
};

const RenderLayoutMenu = (displayMode) => {
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu">
            <Radio.Group onChange={setPageLayout} value={displayMode}>
                <Radio value="single" className="InnerToolbar_SubmenuRadio">
                    {t("GENERAL.SINGLE_PAGE")}
                </Radio>
                <Radio value="single-noscroll" className="InnerToolbar_SubmenuRadio">
                    {t("GENERAL.SINGLE_PAGE_LOCKED")}
                </Radio>
                <Radio value="multi" className="InnerToolbar_SubmenuRadio">
                    {t("GENERAL.MULTI_PAGE")}
                </Radio>
            </Radio.Group>
        </Menu>
    );
};

const RenderSnapOnMenu = (snapMode) => {
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu">
            <Radio.Group onChange={setSnapMode} value={snapMode}>
                <Radio value="end-of-line" className="InnerToolbar_SubmenuRadio">
                    {t("GENERAL.END_OF_LINE")}
                </Radio>
                <Radio value="points" className="InnerToolbar_SubmenuRadio">
                    {t("GENERAL.POINTS")}
                </Radio>
                <Radio value="end-mid-line" className="InnerToolbar_SubmenuRadio">
                    {t("GENERAL.END_AND_MID_LINE")}
                </Radio>
            </Radio.Group>
        </Menu>
    );
};

const RenderTemplates = (toggleTemplateDialog, switchShowSubmenu) => {
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu ">
            <div onClick={toggleTemplateDialog}>
                <div className="Calculate_Submenu_Item Calculate_addTemplate">
                    <span className="Calculate_Submenu_Icon">
                        <FontAwesomeIcon icon={["fal", "edit"]} />
                    </span>
                    <span className="Calculate_Submenu_Item_Label">{t("GENERAL.TEMPLATES")}</span>
                </div>
            </div>
            <Divider />
            <Menu className="TemplateList">
                {map(TemplatesStore.getCalcTemplates(), (item, index) => (
                    <Menu.Item
                        key={index}
                        onClick={() => {
                            MessageHandlerV2Actions.sendUpdate({
                                action: "add_template_to_calculate_folder",
                                folderId: AnnotationStore.getActiveParentId() === -1 ? null : AnnotationStore.getActiveParentId(),
                                templateId: item.id,
                                estimateId: AnnotationStore.getActiveEstimate().get("id"),
                                companyId: ProjectsStore.getActiveProject().toJS().department.company.id,
                            });
                            switchShowSubmenu(false);
                        }}
                    >
                        <div className="Calculate_Submenu_Item">
                            <span className="Calculate_Submenu_Icon">
                                <FontAwesomeIcon icon={["fal", "folder-open"]} />
                            </span>
                            <div className="Calculate_Submenu_Item_WrapName">{item.name}</div>
                        </div>
                    </Menu.Item>
                ))}
            </Menu>
        </Menu>
    );
};

const RenderRowsColumns = (onChangeRowColumnsVisibilty, rowColumnsVisibilty) => {
    const { t } = useTranslation();
    const isViewer = !AuthenticationStore.getRole();

    let RowColumnsOptions = [];

    if (isViewer) {
        RowColumnsOptions = [
            { value: "profession", label: t("ESTIMATE.PROFESSION") },
            { value: "phase", label: t("ESTIMATE.PHASE") },
            { value: "segment", label: t("ESTIMATE.SEGMENT") },
            { value: "action", label: t("ESTIMATE.ACTION") },
            { value: "material", label: t("ESTIMATE.MATERIAL") },
            { value: "unitTime", label: t("GENERAL.UNIT_TIME") },
            { value: "totalTime", label: t("GENERAL.TOTAL_TIME") },
        ];
    } else {
        RowColumnsOptions = [
            { value: "profession", label: t("ESTIMATE.PROFESSION") },
            { value: "phase", label: t("ESTIMATE.PHASE") },
            { value: "segment", label: t("ESTIMATE.SEGMENT") },
            { value: "action", label: t("ESTIMATE.ACTION") },
            { value: "material", label: t("ESTIMATE.MATERIAL") },
            { value: "pricePerUnit", label: t("GENERAL.UNIT_PRICE") },
            { value: "unitTime", label: t("GENERAL.UNIT_TIME") },
            { value: "totalPrice", label: t("GENERAL.TOTAL_PRICE") },
            { value: "totalTime", label: t("GENERAL.TOTAL_TIME") },
        ];
    }

    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu Calculate_Submenu_Checkbox_Group">
            <Checkbox.Group options={RowColumnsOptions} onChange={onChangeRowColumnsVisibilty} value={rowColumnsVisibilty} />
        </Menu>
    );
};

export const submenuItems = ({
    toggleRows,
    isToggleRows,
    toggleProperties,
    isToggleProperties,
    toggleDocument,
    isToggleDocument,
    allKeysSelected,
    collapseAll,
    expandAll,
    allKeysExpanded,
    treeSorting,
    displayMode,
    snapMode,
    changeTreeSorting,
    toggleTemplateDialog,
    switchShowSubmenu,
    onChangeRowColumnsVisibilty,
    rowColumnsVisibilty,
    markersSize,
    changeMarkersSize,
    sideLabelsPosition,
    changeSideLabelsPosition,
    showFileExportToPDFModal,
}) => {
    const role = AuthenticationStore.getRole();
    return [
        {
            onClick: () => AnnotationStore.rotatePDF(),
            icon: <FontAwesomeIcon icon={["fal", "redo"]} />,
            display: true,
            label: "GENERAL.ROTATE",
            shortcut: <Tag>Alt + R</Tag>,
        },
        {
            onClick: (e) => AnnotationStore.undoDrawing(e, true),
            icon: <UndoOutlined />,
            disabled: !role,
            display: true,
            label: "GENERAL.UNDO_PLACEMENT",
            shortcut: <Tag>Ctrl + Z</Tag>,
        },
        {
            onClick: () => AnnotationStore.zoomInPDF(),
            icon: <FontAwesomeIcon icon={["fal", "search-plus"]} />,
            display: true,
            label: "GENERAL.ZOOM_IN",
            shortcut: <Tag>Ctrl + +</Tag>,
        },
        {
            onClick: () => AnnotationStore.zoomOutPDF(),
            icon: <FontAwesomeIcon icon={["fal", "search-minus"]} />,
            display: true,
            label: "GENERAL.ZOOM_OUT",
            shortcut: <Tag>Ctrl + -</Tag>,
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "sign-in"]} />,
            onDropdownOverlay: RenderTemplates(toggleTemplateDialog, switchShowSubmenu),
            dropdownTrigger: "click",
            display: role,
            label: "GENERAL.IMPORT_TEMPLATE",
        },
        {
            divider: true,
        },
        {
            onClick: toggleDocument,
            icon: <FontAwesomeIcon icon={["fal", "copy"]} />,
            className: isToggleDocument ? "Calculate_Submenu_Icon--active" : null,
            display: true,
            label: "GENERAL.FILE",
        },
        {
            onClick: toggleRows,
            icon: <FontAwesomeIcon icon={["fal", "tasks-alt"]} />,
            className: isToggleRows ? "Calculate_Submenu_Icon--active" : null,
            display: true,
            label: "GENERAL.ROWS",
        },
        {
            onClick: toggleProperties,
            icon: <FontAwesomeIcon icon={["fal", "info-circle"]} />,
            className: isToggleProperties ? "Calculate_Submenu_Icon--active" : null,
            display: true,
            label: "GENERAL.PROPERTIES",
        },
        {
            divider: true,
        },
        {
            onClick: () => AnnotationStore.selectAll(),
            icon: <FontAwesomeIcon icon={["fal", "check-square"]} />,
            display: !allKeysSelected,
            label: "GENERAL.SELECT_ALL",
            shortcut: <Tag>Ctrl + A</Tag>,
        },
        {
            onClick: () => deselectAll(),
            icon: <FontAwesomeIcon icon={["fal", "square"]} />,
            display: allKeysSelected,
            label: "GENERAL.DESELECT_ALL",
        },
        {
            onClick: () => expandAll(),
            icon: <FontAwesomeIcon icon={["fal", "plus-square"]} />,
            disabled: allKeysExpanded,
            display: true,
            label: "GENERAL.EXPAND_ALL",
            shortcut: <Tag>Ctrl + Alt + E</Tag>,
        },
        {
            onClick: () => collapseAll(),
            icon: <FontAwesomeIcon icon={["fal", "minus-square"]} />,
            disabled: !allKeysExpanded,
            display: true,
            label: "GENERAL.COLLAPSE_ALL",
            shortcut: <Tag>Ctrl + Alt + W</Tag>,
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "sort-circle"]} />,
            onDropdownOverlay: FilterMenu(changeTreeSorting, treeSorting),
            dropdownTrigger: ["click"],
            display: true,
            label: "GENERAL.SORTING",
        },
        {
            divider: true,
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "table"]} />,
            onDropdownOverlay: RenderRowsColumns(onChangeRowColumnsVisibilty, rowColumnsVisibilty),
            dropdownTrigger: "click",
            display: true,
            label: "ESTIMATE.ROWS_COLUMNS",
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "ticket"]} />,
            onDropdownOverlay: LabelsMenu(changeSideLabelsPosition, sideLabelsPosition, sideLabelsTypes),
            dropdownTrigger: ["click"],
            display: true,
            label: "ESTIMATE.LABELS_CENTER",
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "times-square"]} />,
            onDropdownOverlay: LabelsMenu(changeMarkersSize, markersSize, markerTypes),
            dropdownTrigger: ["click"],
            display: true,
            label: "ESTIMATE.MARKERS",
        },
        {
            icon: <SettingOutlined />,
            onDropdownOverlay: RenderLayoutMenu(displayMode),
            dropdownTrigger: "click",
            display: true,
            label: "GENERAL.LAYOUT_MODE",
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "magnet"]} />,
            onDropdownOverlay: RenderSnapOnMenu(snapMode),
            dropdownTrigger: "click",
            display: true,
            label: "GENERAL.SNAP_ON_MODE",
        },
        {
            onClick: () => showFileExportToPDFModal(),
            icon: <FontAwesomeIcon icon={["fal", "file-export"]} />,
            disabled: allKeysExpanded,
            display: true,
            label: "ESTIMATE.EXPORT_PDF",
        },
    ];
};
