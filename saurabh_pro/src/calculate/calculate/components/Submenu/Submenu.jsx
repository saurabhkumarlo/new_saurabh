import "./submenu.less";

import { Dropdown, Menu } from "antd";
import React, { Fragment } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { map } from "lodash";
import { submenuItems } from "./Submenu.utils";
import { useTranslation } from "react-i18next";

const Submenu = ({
    toggleRows,
    isToggleRows,
    toggleProperties,
    isToggleProperties,
    toggleDocument,
    isToggleDocument,
    allKeysSelected,
    collapseAll,
    expandAll,
    renderPdfMenu,
    allKeysExpanded,
    treeSorting,
    displayMode,
    changeTreeSorting,
    snapMode,
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
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu">
            {map(
                submenuItems({
                    toggleRows,
                    isToggleRows,
                    toggleProperties,
                    isToggleProperties,
                    toggleDocument,
                    isToggleDocument,
                    allKeysSelected,
                    collapseAll,
                    expandAll,
                    renderPdfMenu,
                    allKeysExpanded,
                    treeSorting,
                    displayMode,
                    changeTreeSorting,
                    snapMode,
                    toggleTemplateDialog,
                    switchShowSubmenu,
                    onChangeRowColumnsVisibilty,
                    rowColumnsVisibilty,
                    markersSize,
                    changeMarkersSize,
                    sideLabelsPosition,
                    changeSideLabelsPosition,
                    showFileExportToPDFModal,
                }),
                (item, index) => (
                    <Fragment key={index}>
                        {item.display ? (
                            item.onDropdownOverlay && item.dropdownTrigger ? (
                                <Menu.Item>
                                    <Dropdown overlay={item.onDropdownOverlay} placement="bottomRight" overlayClassName="Calculate_Submenu_Dropdown">
                                        <div className="Calculate_Submenu_Item">
                                            <span className="Calculate_Submenu_Icon">{item.icon}</span>
                                            <span className="Calculate_Submenu_Item_Label">{t(item.label)}</span>
                                            <span className="Calculate_Submenu_Shortcut">
                                                <FontAwesomeIcon icon={["fal", "chevron-right"]} />
                                            </span>
                                        </div>
                                    </Dropdown>
                                </Menu.Item>
                            ) : (
                                <Menu.Item onClick={item.onClick} disabled={item.disabled}>
                                    <div className="Calculate_Submenu_Item">
                                        <span className={`${item.className} Calculate_Submenu_Icon`}>{item.icon}</span>
                                        <span className="Calculate_Submenu_Item_Label">{t(item.label)}</span>
                                        <span className="Calculate_Submenu_Shortcut">{item.shortcut}</span>
                                    </div>
                                </Menu.Item>
                            )
                        ) : (
                            item.divider && <Menu.Divider />
                        )}
                    </Fragment>
                )
            )}
        </Menu>
    );
};

export default Submenu;
