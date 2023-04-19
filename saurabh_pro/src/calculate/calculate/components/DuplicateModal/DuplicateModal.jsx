import React from "react";

import { Modal, Progress, Spin } from "antd";
import { AuthenticationStore } from "stores";

import "./duplicate-modal.less";

const UI_UPDATE_STRING = "Applying changes";
const USER_DUPLICATING_STRING = "Working on it";
const OTHER_USER_DUPLICATING_STRING = "Receiving large changes from another user";

const DuplicateModal = ({ visible, toDuplicate, duplicated, updatingUI, userId }) => {
    const title = userId === AuthenticationStore.getUserId() ? USER_DUPLICATING_STRING : OTHER_USER_DUPLICATING_STRING;
    const percent = ((duplicated / toDuplicate) * 100).toFixed(1);

    return (
        <Modal visible={visible} footer={null} closable={false} title={title}>
            <div className="DuplicateModal">
                <Progress percent={percent} />
                {updatingUI && (
                    <>
                        <Spin />
                        <p>{UI_UPDATE_STRING}</p>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default DuplicateModal;
