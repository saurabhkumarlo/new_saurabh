import "./folder-dialog.less";

import { AnnotationStore, TemplatesStore } from "../../stores";
import { Button, Col, Divider, Dropdown, Menu, Radio, Row, Spin } from "antd";
import { Input, TemplatesTree } from "./components";
import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal } from "..";
import { useTranslation } from "react-i18next";

const TemplatesDialog = ({
    visible,
    onCancel,
    onAccept,
    isAdding,
    isAddingFolder,
    idUpdating,
    templates,
    activeTemplate,
    selectedNodeId,
    type,
    onChangeActiveTemplate,
    onAddTemplate,
    onDeleteTemplate,
    onDuplicateTemplate,
    onUpdateTemplate,
    onAddFolder,
    onUpdateFolder,
    onDeleteFolder,
    onChangeSelectedNodeId,
}) => {
    const { t } = useTranslation();
    const [activeInputId, setActiveInputId] = useState("");

    const antLoader = <LoadingOutlined spin />;

    const TemplatesBody = templates.length > 0 && (
        <Radio.Group value={activeTemplate.id}>
            {templates.map((item, index) => (
                <Radio key={index} value={item.id} onClick={() => onChangeActiveTemplate(item)}>
                    {item.id === activeInputId ? (
                        <Input item={item} object="name" onBlur={() => setActiveInputId("")} onPressEnter={onUpdateTemplate} />
                    ) : (
                        <div className="Template_Estimate_Name">{item.name}</div>
                    )}
                    {idUpdating === item.id ? (
                        <Spin indicator={antLoader} />
                    ) : (
                        <Dropdown
                            overlay={
                                <Menu className="Calculate_Rows_ContextMenu">
                                    <Menu.Item key="rename" onClick={() => setActiveInputId(item.id)}>
                                        <FontAwesomeIcon icon={["fal", "edit"]} />
                                        {t("GENERAL.RENAME")}
                                    </Menu.Item>
                                    <Menu.Item key="duplicate" onClick={() => onDuplicateTemplate(item.id)}>
                                        <FontAwesomeIcon icon={["fal", "copy"]} />
                                        {t("GENERAL.DUPLICATE")}
                                    </Menu.Item>
                                    <Divider />
                                    <Menu.Item key="delete" danger onClick={() => onDeleteTemplate(item.id)} disabled={idUpdating === item.id}>
                                        <FontAwesomeIcon icon={["fal", "trash"]} />
                                        {t("GENERAL.DELETE")}
                                    </Menu.Item>
                                </Menu>
                            }
                            trigger={["click"]}
                        >
                            <Button type="text" icon={<FontAwesomeIcon icon={["fal", "ellipsis-h-alt"]} />} disabled={isAdding || isAddingFolder} />
                        </Dropdown>
                    )}
                </Radio>
            ))}
        </Radio.Group>
    );

    return (
        <Modal
            title={
                <Row justify="space-between" align="middle" className="Modal_Title">
                    <Col>{t("GENERAL.TEMPLATES")}</Col>
                </Row>
            }
            visible={visible}
            onOk={onAccept}
            onCancel={onCancel}
            closable
            maskClosable={false}
            footer={null}
            className={`Modal_Container`}
        >
            <div className="Template_Container">
                <div className="Template_Section">
                    <Button
                        type="text"
                        icon={<FontAwesomeIcon icon={["fal", "plus-circle"]} />}
                        className="Action_Button"
                        disabled={isAdding || isAddingFolder}
                        loading={isAdding}
                        onClick={onAddTemplate}
                    >
                        {t("GENERAL.ADD_TEMPLATE")}
                    </Button>
                    {TemplatesBody}
                </div>

                <div className="Divider_Section">
                    <Divider type="vertical" />
                </div>

                <div className="Folder_Section">
                    {templates.length > 0 && (
                        <TemplatesTree
                            treeData={TemplatesStore.buildTreeStructure(activeTemplate.folders)}
                            type={type}
                            selectedNodeId={selectedNodeId}
                            onUpdateFolder={onUpdateFolder}
                            isAddingFolder={isAddingFolder}
                            onAddFolder={onAddFolder}
                            onDeleteFolder={onDeleteFolder}
                            onChangeSelectedNodeId={onChangeSelectedNodeId}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TemplatesDialog;
