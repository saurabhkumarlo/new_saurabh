import { Dropdown, Menu } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { map } from "lodash";
import { submenuItems } from "./Submenu.utils";
import { useTranslation } from "react-i18next";

const Submenu = ({ templateModalVisible, switchShowSubmenu, allKeysExpanded, expandAll, collapseAll }) => {
    const { t } = useTranslation();
    return (
        <Menu className="Calculate_Rows_ContextMenu Calculate_Submenu">
            {map(
                submenuItems({
                    templateModalVisible,
                    switchShowSubmenu,
                    allKeysExpanded,
                    expandAll,
                    collapseAll,
                }),
                (item) =>
                    item.display ? (
                        item.onDropdownOverlay && item.dropdownTrigger ? (
                            <Menu.Item disabled={item.disabled}>
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
                    )
            )}
        </Menu>
    );
};

export default Submenu;
