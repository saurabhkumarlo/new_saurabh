import { Empty } from "antd";
import React from "react";
import { withTranslation } from "react-i18next";

class NoPreview extends React.PureComponent {
    render() {
        const { t } = this.props;

        return <Empty description={t("ERROR.UNABLE_TO_PREVIEW_FILE")} style={{ marginTop: "30vh" }} />;
    }
}

export default withTranslation()(NoPreview);
