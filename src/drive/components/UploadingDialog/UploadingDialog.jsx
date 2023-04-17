import "./uploadingDialog.less";

import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";

import React from "react";
import { useTranslation } from "react-i18next";

const UploadingDialog = ({ loaded, wanted, filesName }) => {
    const { t } = useTranslation();
    const uploadIcon = loaded === wanted ? <CheckCircleFilled /> : <LoadingOutlined spin />;
    const filesNameArr = filesName.length > 3 ? [...filesName.slice(0, 3), "..."] : filesName;

    return (
        //LOCALISATION
        <div className="UploadDialog-wrapper">
            {uploadIcon} <label>{`${t("GENERAL.UPLOADING")} ${loaded}/${wanted} ${filesNameArr.join(", ")}`}</label>
        </div>
    );
};

export default UploadingDialog;
