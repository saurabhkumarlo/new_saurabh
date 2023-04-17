import React from "react";
import { useTranslation } from "react-i18next";
import { map } from "lodash";
import { Col, Row, Select as BaseSelect } from "antd";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./select.less";

const Select = ({ label, options, ...props }) => {
    const { t } = useTranslation();
    const selectOptions = map(options, (item) => (
        <BaseSelect.Option value={item.value} key={item.value} id={`select-${item.value.toLowerCase().replaceAll(" ", "-")}--option`}>
            <div
                className={`Select_Option ${item.centered ? "Select_Option_Centered" : ""} ${item.rotated ? "Select_Option_Rotated" : ""}`}
                style={item.font && { fontFamily: item.value }}
                id={`selected-${item.value.toLowerCase().replaceAll(" ", "-")}--option`}
            >
                {item.iconName && <img src={item.iconName} className="Select_Option_Icon" />}
                {item.name}
            </div>
        </BaseSelect.Option>
    ));

    return (
        <Row className="Select_Wrapper" id={`select-${label.toLowerCase().replaceAll(" ", "-")}--button`}>
            <Col span={24} id={`select-${label.toLowerCase().replaceAll(" ", "-")}--title`}>
                {t(label)}
            </Col>
            <Col span={24}>
                <BaseSelect suffixIcon={<FontAwesomeIcon icon={faCaretDown} />} {...props}>
                    {selectOptions}
                </BaseSelect>
            </Col>
        </Row>
    );
};

export default Select;
