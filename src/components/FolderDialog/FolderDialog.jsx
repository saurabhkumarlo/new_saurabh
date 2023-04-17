import "./folder-dialog.less";

import { Input as AntInput, Button, Col, Divider, Dropdown, Menu, Radio, Row, Spin, Tag } from "antd";
import { AuthenticationStore, EstimateStore, ProjectsStore } from "../../stores";
import { EstimatesTree, Input } from "./components";
import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal } from "../";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { getEstimatesData } from "./FolderDialog.utils";
import { useTranslation } from "react-i18next";

const FolderDialog = ({
    visible,
    onCancel,
    onAccept,
    title,
    addEstimate,
    estimates,
    activeEstimate,
    isAdding,
    idUpdating,
    onDeleteEstimate,
    onRenameEstimate,
    onCopyEstimate,
    onLockEstimate,
    onDoubleClickDrive,
    selectedKeys,
}) => {
    const { t } = useTranslation();
    const role = AuthenticationStore.getRole();
    const [filterValue, setFilterValue] = useState("");
    const [selectedEstimate, setSelectedEstimate] = useState();
    const [isRemovingDialogVisible, setIsRemovingDialogVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const confirmValue = t("Delete");
    const [error, setError] = useState("");

    useEffect(() => {
        return () => {
            setFilterValue("");
            setSelectedEstimate();
            setIsRemovingDialogVisible(false);
            setInputValue("");
        };
    }, []);

    const onChangeEstimate = (item) => {
        if (item.id !== EstimateStore.getActiveEstimate().id) {
            EstimateStore.setActiveEstimate(item);
        }
    };

    const onRemoveEstimate = (item) => {
        setSelectedEstimate(item);
        setIsRemovingDialogVisible(true);
    };

    const onCancelRemoveEstimate = () => {
        setSelectedEstimate();
        setIsRemovingDialogVisible(false);
        setInputValue("");
    };

    const onAcceptRemoveEstimate = () => {
        onDeleteEstimate(ProjectsStore.getActiveProjectId(), selectedEstimate.id);
        onCancelRemoveEstimate();
    };
    const handleRename = (geoProjectId, estimateId, value) => {
        if (value?.trim().length) {
            onRenameEstimate(geoProjectId, estimateId, value);
            setSelectedEstimate();
        } else {
            setError(t("GENERAL.REQUIRED"));
        }
    };
    const antLoader = <LoadingOutlined spin />;

    const QuickSwitchBody = (
        <Radio.Group value={activeEstimate.id}>
            {getEstimatesData(estimates, filterValue).map((item, index) => (
                <Radio key={index} value={item.id} onClick={() => onChangeEstimate(item)}>
                    {item.id === selectedEstimate?.id && !isRemovingDialogVisible ? (
                        <>
                            <Input
                                item={item}
                                onBlur={() => {
                                    setSelectedEstimate();
                                }}
                                isQuickSwitch
                                onPressEnter={handleRename}
                            />
                            {error && (
                                <span class="ant-form-item-explain ant-form-item-explain-error">
                                    <span role="alert">{error}</span>
                                </span>
                            )}
                        </>
                    ) : (
                        <div className="Template_Estimate_Name">
                            {item.locked && <FontAwesomeIcon className="QuickSwitch_Title_Lock_Icon" icon={faLock} />}
                            {item.name}
                        </div>
                    )}
                    {idUpdating === item.id ? (
                        <Spin indicator={antLoader} />
                    ) : (
                        <Dropdown
                            overlay={
                                <Menu className="Calculate_Rows_ContextMenu">
                                    <Menu.Item
                                        disabled={!role}
                                        key="rename"
                                        onClick={() => {
                                            setError("");
                                            setSelectedEstimate(item);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={["fal", "edit"]} />
                                        {t("GENERAL.RENAME")}
                                    </Menu.Item>
                                    <Menu.Item disabled={!role} key="duplicate" onClick={() => onCopyEstimate(item.geoProjectId, item.id)}>
                                        <FontAwesomeIcon icon={["fal", "copy"]} />
                                        {t("GENERAL.DUPLICATE")}
                                    </Menu.Item>
                                    <Menu.Item disabled={!role} key="lock-estimate" onClick={() => onLockEstimate(item.geoProjectId, item.id, !item.locked)}>
                                        <FontAwesomeIcon icon={["fal", item.locked ? "unlock" : "lock"]} />
                                        {t(item.locked ? "ESTIMATE.UNLOCK_ESTIMATE" : "ESTIMATE.LOCK_ESTIMATE")}
                                    </Menu.Item>
                                    <Divider />
                                    <Menu.Item
                                        key="delete"
                                        onClick={() => onRemoveEstimate(item)}
                                        danger
                                        disabled={idUpdating === item.id || estimates.length === 1 || !role}
                                    >
                                        <FontAwesomeIcon icon={["fal", "trash"]} />
                                        {t("GENERAL.DELETE")}
                                    </Menu.Item>
                                </Menu>
                            }
                            trigger={["click"]}
                        >
                            <Button type="text" icon={<FontAwesomeIcon icon={["fal", "ellipsis-h-alt"]} />} />
                        </Dropdown>
                    )}
                </Radio>
            ))}
        </Radio.Group>
    );

    return (
        <>
            {isRemovingDialogVisible && (
                <Modal
                    title={t("ESTIMATE.DELETE_ESTIMATE")}
                    visible={isRemovingDialogVisible}
                    onCancel={onCancelRemoveEstimate}
                    cancelText={t("GENERAL.CANCEL")}
                    activeButtons={
                        <Button key="submit" type="danger" onClick={onAcceptRemoveEstimate} disabled={inputValue !== confirmValue} autoFocus>
                            {t("GENERAL.DELETE")}
                        </Button>
                    }
                    destroyOnClose
                >
                    <label className="Drive_Delete_Dialog">
                        {t("ESTIMATE.PERMANENTLY_DELETE_ESTIMATE")} <br /> <br /> <span>{selectedEstimate?.name}</span>
                    </label>
                    <br />
                    <br />
                    <label className="Drive_Delete_Dialog">
                        {t("ESTIMATE.ENTER_CONFIMRATION_STRING_TO_DELETE")} <Tag>{t("GENERAL.DELETE")}</Tag>
                    </label>
                    <AntInput
                        className="Delete_Input"
                        placeholder={t("GENERAL.DELETE")}
                        onChange={(e) => setInputValue(e.target.value)}
                        value={inputValue}
                        autoFocus
                    />
                </Modal>
            )}
            <Modal
                title={
                    <Row justify="space-between" align="middle" className="Modal_Title">
                        <Col>{t(title)}</Col>

                        <Col className="Modal_Title_Filter">
                            <AntInput
                                placeholder={t("GENERAL.SEARCH")}
                                prefix={<FontAwesomeIcon icon={["fal", "search"]} />}
                                type="text"
                                onChange={(e) => setFilterValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                }
                visible={visible}
                onOk={onAccept}
                onCancel={onCancel}
                closable
                footer={null}
                className={`Modal_Container Modal_Container_Top`}
            >
                <div className="Template_Container">
                    <div className="Template_Section">
                        <p>{t("GENERAL.ESTIMATES")}</p>
                        <Button
                            type="text"
                            icon={<FontAwesomeIcon icon={["fal", "plus-circle"]} />}
                            className="Action_Button"
                            onClick={addEstimate}
                            disabled={isAdding || !role}
                            loading={isAdding}
                        >
                            {t("ESTIMATE.ADD_ESTIMATE")}
                        </Button>
                        {QuickSwitchBody}
                    </div>

                    <div className="Divider_Section">
                        <Divider type="vertical" />
                    </div>

                    <div className="Folder_Section">
                        <p>{t("GENERAL.FILES")}</p>

                        <EstimatesTree filterValue={filterValue} onDoubleClickDrive={onDoubleClickDrive} onCancel={onCancel} selectedKeys={selectedKeys} />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default FolderDialog;
