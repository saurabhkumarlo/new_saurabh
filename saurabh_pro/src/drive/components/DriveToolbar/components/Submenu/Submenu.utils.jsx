import { AnnotationStore, AuthenticationStore, ProjectsStore, TemplatesStore } from "../../../../../stores";
import { Divider, Menu, Tag } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MessageHandlerV2Actions } from "../../../../../actions";
import React from "react";
import { map } from "lodash";
import { useTranslation } from "react-i18next";

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
            <div className="TemplateList">
                {map(TemplatesStore.getDriveTemplates(), (item) => (
                    <Menu.Item
                        onClick={() => {
                            switchShowSubmenu();
                            MessageHandlerV2Actions.sendUpdate({
                                action: "add_template_to_drive_folder",
                                folderId: AnnotationStore.getActiveFileId() === -1 ? null : AnnotationStore.getActiveFileId(),
                                templateId: item.id,
                                projectId: ProjectsStore.getActiveProjectId(),
                                companyId: ProjectsStore.getActiveProject().toJS().department.company.id,
                            });
                        }}
                        disabled={AnnotationStore.getActiveFileId() === -1}
                    >
                        <div className="Calculate_Submenu_Item">
                            <span className="Calculate_Submenu_Icon">
                                <FontAwesomeIcon icon={["fal", "folder-open"]} />
                            </span>
                            <div className="Calculate_Submenu_Item_WrapName">{item.name}</div>
                        </div>
                    </Menu.Item>
                ))}
            </div>
        </Menu>
    );
};

export const submenuItems = ({ templateModalVisible, switchShowSubmenu, allKeysExpanded, expandAll, collapseAll }) => {
    return [
        {
            onClick: () => expandAll(),
            icon: <FontAwesomeIcon icon={["fal", "plus-square"]} />,
            display: true,
            disabled: allKeysExpanded,
            label: "GENERAL.EXPAND_ALL",
            shortcut: <Tag>Ctrl + Shift + E</Tag>,
        },
        {
            onClick: () => collapseAll(),
            icon: <FontAwesomeIcon icon={["fal", "minus-square"]} />,
            display: true,
            disabled: !allKeysExpanded,
            label: "GENERAL.COLLAPSE_ALL",
            shortcut: <Tag>Ctrl + Shift + W</Tag>,
        },
        {
            icon: <FontAwesomeIcon icon={["fal", "sign-in"]} />,
            onDropdownOverlay: RenderTemplates(templateModalVisible, switchShowSubmenu),
            dropdownTrigger: "click",
            disabled: !AuthenticationStore.getRole(),
            display: AuthenticationStore.getRole(),
            label: "GENERAL.IMPORT_TEMPLATE",
        },
    ];
};
