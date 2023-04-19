import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Input, Checkbox } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CalculationStore from "../../../../stores/CalculationStore";

import "./filterdropdown.less";

const FilterDropdown = ({ object, annotationRows, event, onChangeFilters }) => {
    const { t } = useTranslation();
    const { setSelectedKeys, selectedKeys, confirm, clearFilters } = event;
    const [filterObjects, setFilterObjects] = useState(generateFilters(object));
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        setFilterObjects(generateFilters(object));
    }, [JSON.stringify(annotationRows)]);

    function generateFilters(column) {
        return annotationRows.reduce((acc, item) => {
            const index = acc.findIndex((accItem) => accItem.value === item.annotationRow[column]);

            if (index <= -1 && item.annotationRow[column] !== "") {
                if (object === "status") {
                    acc.push({
                        label: CalculationStore.getVisibleStatusValue(item.annotationRow[column]),
                        value: item.annotationRow[column],
                    });
                } else {
                    acc.push({
                        label: item.annotationRow[column],
                        value: item.annotationRow[column],
                    });
                }
            }

            return acc;
        }, []);
    }

    const onSearch = (event) => {
        const value = event.target.value;

        const selectedKeysArray = selectedKeys.reduce((acc, item) => {
            acc.push({ label: item, value: item });
            return acc;
        }, []);

        const filteredArray = generateFilters(object).filter((item) => item.label.toLowerCase().includes(value.toLowerCase()));
        const data = selectedKeysArray.concat(filteredArray);
        const uniqueArray = [...new Map(data.map((item) => [item["label"], item])).values()];

        setSearchValue(value);
        setFilterObjects(uniqueArray);
    };

    const onChangeCheckbox = (checkedValues) => {
        setSelectedKeys(checkedValues);
    };

    const onFilter = () => {
        confirm();
        onChangeFilters(selectedKeys, object);
    };

    const onReset = () => {
        setSearchValue("");
        clearFilters();
        onChangeFilters([], object, true);
    };

    return (
        <div className="Filter_Dropdown_Rows">
            <Input placeholder="Search" prefix={<FontAwesomeIcon icon={["fal", "search"]} />} bordered={false} value={searchValue} onChange={onSearch} />
            <Divider />
            <Checkbox.Group options={filterObjects} onChange={onChangeCheckbox} value={selectedKeys} />
            <Divider />
            <div className="Action_Section">
                <Button type="text" onClick={onReset}>
                    {t("Reset")}
                </Button>
                <Button type="primary" onClick={onFilter}>
                    {t("Filter")}
                </Button>
            </div>
        </div>
    );
};

export default FilterDropdown;
