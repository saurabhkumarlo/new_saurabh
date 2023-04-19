import React, { useEffect, useState } from "react";

import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { useTranslation } from "react-i18next";

const LabelList = ({ activeLabels, updateActiveLabels, disabled }) => {
    const { t } = useTranslation();
    const [data, setData] = useState(activeLabels);

    useEffect(() => {
        setData(activeLabels);
    }, [activeLabels]);

    const onClick = (e) => {
        const value = e.target.dataset.value ? e.target.dataset.value === "true" : e.currentTarget.getAttribute("value") === "true";
        const obj = e.target.dataset.label || e.currentTarget.getAttribute("label");
        updateActiveLabels(value, obj);
    };

    return (
        <div className="active-labels-list">
            {_.map(data, (labelData) => (
                <div key={labelData.label} className={`active-labels-item${disabled ? " active-labels-item-disabled" : ""}`}>
                    <Button
                        type="text"
                        icon={<FontAwesomeIcon icon={["fal", "times-circle"]} data-label={labelData.label} data-value={false} onClick={onClick} />}
                        disabled={disabled}
                    />
                    {t(labelData.label)}
                    {!labelData.inEvery && (
                        <Button type="link" label={labelData.label} value={true} onClick={onClick} disabled={disabled}>
                            {t("ESTIMATE.LABELS.ADD_TO_ALL")}
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default LabelList;
