import React from "react";
import { useTranslation } from "react-i18next";

import { Col, Row, Select } from "antd";
import { workflowSelectItems } from "./WorkflowPane.utils";

import "./workflow.less";

const WorkflowPane = ({ status, onChangeStatus }) => {
    const nodeStatus = status ? status : "notStarted";
    const { t } = useTranslation();

    return (
        <div className="Workflow">
            <label>
                {t("GENERAL.STATUS")}
                <Select className="Workflow_Select" value={nodeStatus} onChange={onChangeStatus}>
                    {workflowSelectItems().map((item, key) => (
                        <Select.Option value={item.value} key={key}>
                            <Row wrap={false}>
                                <Col className="Workflow_Select_Icon_Wrapper">
                                    <Row align="middle" justify="center" className="Workflow_Select_Icon">
                                        <item.StatusIcon />
                                    </Row>
                                </Col>
                                <Col>{t(item.label)}</Col>
                            </Row>
                        </Select.Option>
                    ))}
                </Select>
            </label>
        </div>
    );
};

export default WorkflowPane;
