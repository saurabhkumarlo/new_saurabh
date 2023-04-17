import React, { useState } from "react";
import { Input as AntInput } from "antd";

const Input = ({ item, onBlur, object, objectName, onPressEnter, treeInput }) => {
    const [value, setValue] = useState(item[object]);

    return (
        <AntInput
            placeholder={objectName}
            autoFocus
            onBlur={onBlur}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPressEnter={() => {
                onPressEnter(item.id, value, false, object);
                onBlur();
            }}
            className={`${treeInput && "Tree_Input"}`}
        />
    );
};

export default Input;
