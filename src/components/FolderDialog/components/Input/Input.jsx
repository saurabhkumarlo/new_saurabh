import React, { useState } from "react";

import { Input as AntInput } from "antd";

const Input = ({ item, onBlur, onPressEnter, isQuickSwitch = false, ...rest }) => {
    const [value, setValue] = useState(item?.name);

    return (
        <AntInput
            placeholder={item?.name}
            autoFocus
            onBlur={onBlur}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPressEnter={() => {
                onPressEnter(item.geoProjectId, item?.id, value);
                if (!isQuickSwitch) onBlur();
            }}
            {...rest}
        />
    );
};

export default Input;
