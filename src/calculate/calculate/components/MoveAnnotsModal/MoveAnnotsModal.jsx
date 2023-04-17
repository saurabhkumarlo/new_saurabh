import React from "react";
import { useTranslation } from "react-i18next";
import { List } from "antd";
import { Modal } from "components";
import { renderListItem } from "../CalculateProperties/components/components.utils";

const MoveAnnotModal = ({ visible, onCancel, annotationLists }) => {
    const { t } = useTranslation();

    return (
        <Modal className="Modal" title={t("Move Objects")} visible={visible} onCancel={onCancel} activeButtons={<div />}>
            <label>{`${t(
                "You are unable to move this selection because it contains locked objects. Please unlock them before moving or move them to a different location"
            )}.`}</label>
            <List className="List" dataSource={annotationLists.toJS()} renderItem={(item) => renderListItem(item)} />
        </Modal>
    );
};

export default MoveAnnotModal;
