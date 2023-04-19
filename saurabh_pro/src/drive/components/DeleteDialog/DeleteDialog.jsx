import { Button, Input, Tag } from "antd";
import { withTranslation } from "react-i18next";
import { Modal } from "../../../components";
import React from "react";

import "./deletedialog.less";

class DeleteDialog extends React.PureComponent {
    state = {
        canConfirm: false,
        typedValue: "",
    };

    resetState = () => {
        this.setState({
            typedValue: "",
            canConfirm: false,
        });
    };

    onInput = (e) => {
        this.setState({
            typedValue: e.target.value,
            canConfirm: e.target.value === this.props.t("GENERAL.DELETE"),
        });
    };

    onCancel = () => {
        this.props.onCancel();
        this.resetState();
    };

    onConfirm = () => {
        this.props.onConfirm(this.state.selectedVersion);
        this.resetState();
    };

    render() {
        const { t } = this.props;

        return (
            <Modal
                title={t("GENERAL.DELETE_FOLDER_OR_FILE")}
                visible={this.props.visible}
                onCancel={this.onCancel}
                submitButtonTitle={t("GENERAL.DELETE")}
                activeButtons={
                    <Button key="submit" type="danger" onClick={this.onConfirm} disabled={!this.state.canConfirm} autoFocus>
                        {t("GENERAL.DELETE")}
                    </Button>
                }
                destroyOnClose
            >
                <label className="Drive_Delete_Dialog">
                    {t("DRIVE.PERMANENTLY_DELETE_FILE")}<br/><br/><span>{this.props.confirmValue}</span>{" "}<br/><br/>
                    {t("DRIVE.DELETE_FODLER_OR_FILE_MESSAGE")} &nbsp; <Tag>{t("GENERAL.DELETE")}</Tag>
                    <Input className="Delete_Input" placeholder={t("GENERAL.DELETE")} onChange={this.onInput} value={this.state.typedValue} autoFocus />
                </label>
            </Modal>
        );
    }
}

export default withTranslation()(DeleteDialog);
