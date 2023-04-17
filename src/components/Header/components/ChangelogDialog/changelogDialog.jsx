import React, { useEffect, useState } from "react";

import { Modal } from "antd";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";

const ChangelogDialog = ({ visible, onCancel }) => {
    const [changelogText, setChangelogText] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        const changelogPath = require("./CHANGELOG.md");

        fetch(changelogPath)
            .then((response) => {
                return response.text();
            })
            .then((text) => setChangelogText(text));
    }, []);

    return (
        <Modal className="Modal ChangelogDialog" closable visible={visible} onCancel={onCancel} footer={null} title={t("GENERAL.CHANGELOG")}>
            <div className="TermsOfService_Card_File_Container">
                <article className="TermsOfService_Card_Article">
                    <ReactMarkdown children={changelogText} linkTarget="_blank" />
                </article>
            </div>
        </Modal>
    );
};

export default ChangelogDialog;
