import React from "react";
import { useTranslation } from "react-i18next";
import { List } from "antd";
import { Modal } from "../../../../components";

import "./delete-modal.less";
import { renderListItem } from "../CalculateProperties/components/components.utils";

const DeleteModal = ({ visible, onCancel, annotationLists, onAccept }) => {
    const { t } = useTranslation();

    if (annotationLists.readOnlyList.length)
        return (
            <Modal className="Modal" title={t("Delete Objects")} visible={visible} onCancel={onCancel} activeButtons={<div />}>
                <label>{`${t(
                    "You are unable to delete this selection because it contains locked objects. Please unlock them before deleting or move them to a different location"
                )}.`}</label>
                <List className="List" dataSource={annotationLists.readOnlyList} renderItem={(item) => renderListItem(item)} />
            </Modal>
        );
    else
        return (
            <Modal className="Modal" title={t("Delete Objects")} visible={visible} onOk={onAccept} onCancel={onCancel} submitButtonTitle={t("Delete")}>
                <label>{`${t("Please confirm deletion of the following objects")}:`}</label>
                <List className="List" dataSource={annotationLists.readWriteList} renderItem={(item) => renderListItem(item)} />
            </Modal>
        );
};

export default DeleteModal;
