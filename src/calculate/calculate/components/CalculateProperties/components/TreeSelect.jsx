import React from "react";
import { TreeSelect as AntTreeSelect } from "antd";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

const TreeSelect = ({ label, value, data, onUpdate, ...rest }) => {
    const { t } = useTranslation();

    const onChange = (value) => {
        if (value === "root") value = null;
        onUpdate(value);
    };

    return (
        <div className="properties-pane-item">
            <label>{t(label)}</label>
            <AntTreeSelect
                treeData={data}
                treeDefaultExpandAll
                value={value}
                onChange={onChange}
                suffixIcon={<FontAwesomeIcon icon={faCaretDown} />}
                {...rest}
            />
        </div>
    );
};

export default TreeSelect;
