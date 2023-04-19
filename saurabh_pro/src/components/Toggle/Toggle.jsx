import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Row, Switch } from "antd";

import "./toggle.less";

const Toggle = ({ label, onChange, checked = false, reverseValue = false, ...props }) => {
    const { t } = useTranslation();

    return (
        <Row wrap={false} align="middle" gutter={[16, 0]} className="Toggle_Wrapper">
            <Col>
                <Switch checked={reverseValue ? !checked : checked} onChange={(e) => onChange(reverseValue ? !e : e)} {...props} />
            </Col>
            <Col className="Toggle_Label">{t(label)}</Col>
        </Row>
    );
};

export default Toggle;
