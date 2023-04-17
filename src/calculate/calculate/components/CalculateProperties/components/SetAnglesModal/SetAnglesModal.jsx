import "./setAnglesModal.less";

import { Checkbox, Divider, Modal } from "../../../../../../components";
import { Col, Input, Row } from "antd";
import React, { useState } from "react";

import { chceckboxFileds } from "./SetAnglesModal.utils";
import { useTranslation } from "react-i18next";

const SetAnglesModal = ({ modalVisible, cancelModal, onSubmit, okButtonDisabled, onCheckboxChecked, inputLabel, checkboxStatuses }) => {
    const { t } = useTranslation();
    const [angle, setAngle] = useState("");

    return (
        <Modal
            visible={modalVisible}
            title={t("ESTIMATE.SET_ANGLES")}
            submitButtonTitle={t("ESTIMATE.SET_ANGLES")}
            onCancel={cancelModal}
            onOk={() => onSubmit(angle)}
            cancelText={t("GENERAL.CANCEL")}
            disabledOkButton={okButtonDisabled || angle === ""}
            className="Angles_Modal"
            closable
        >
            <Row>
                <Col span={11}>
                    {chceckboxFileds.map(({ name, label }) => (
                        <Col span={24} offset={2} key={name}>
                            <Checkbox name={name} label={t(label)} onChange={onCheckboxChecked} checked={checkboxStatuses[name]} />
                        </Col>
                    ))}
                </Col>

                <Col span={1} offset={1}>
                    <Divider vertical />
                </Col>

                <Col span={11}>
                    <Col span={24} offset={2}>
                        {t(inputLabel)}
                    </Col>
                    <Col span={24} offset={2}>
                        <Input type="number" value={angle} onChange={(e) => setAngle(e.target.value)} />
                    </Col>
                </Col>
            </Row>
        </Modal>
    );
};

export default SetAnglesModal;
