import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { filter, includes } from "lodash";
import { AutoComplete as BaseAutocomplete, Col, Row } from "antd";

import "./autocomplete.less";

const Autocomplete = ({ label, options, value, onSelect, type = "text", ...props }) => {
    const { t } = useTranslation();
    const [selectedValue, setSelectedValue] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState(options);

    const onSearch = (searchText) => setFilteredOptions(!searchText ? [] : filter(options, (el) => includes(el.value.toString(), searchText)));

    const validateValue = (value) => type === "text" || (type === "number" && !isNaN(value) && setSelectedValue(value));

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    return (
        <Row className="Autocomplete_Wrapper" id={`autocomplete-${label.toLowerCase().replaceAll(" ", "-")}--button`}>
            <Col span={24}>{t(label)}</Col>
            <Col span={24}>
                <BaseAutocomplete
                    value={selectedValue}
                    options={filteredOptions}
                    onSelect={onSelect}
                    onSearch={onSearch}
                    onChange={validateValue}
                    onBlur={() => onSelect(selectedValue)}
                    {...props}
                />
            </Col>
        </Row>
    );
};

export default Autocomplete;
