import React from "react";
import { useTranslation } from "react-i18next";
import bytes from "bytes";
import { get } from "lodash";
import moment from "moment";

import "./detailsPane.less";
const DetailsPane = ({ selectedNode }) => {
    const { t } = useTranslation();

    return (
        <div className="DetailsPane">
            <label>
                {t("GENERAL.SIZE")}
                <span>{bytes(get(selectedNode, "size") || 0)}</span>
            </label>
            <label>
                {t("GENERAL.CREATED")}
                <span>{selectedNode.added ? moment(selectedNode.added).format("YYYY-MM-DD hh:mma") : ""}</span>
            </label>
        </div>
    );
};

export default DetailsPane;
