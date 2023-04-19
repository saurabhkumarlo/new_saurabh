import React from "react";
import { Table, Row, Col } from "antd";
import { Modal } from "components";
import { useTranslation } from "react-i18next";
import "./confirmationModal.less";
import _ from "lodash";
import { workflowSelectItemsWithStatus } from "../CalculateProperties/CalculateProperties.utils";

const ConfirmationModal = ({ visible, onOk, onCancel, data }) => {
    const { annots, key, value, additional } = data;
    const { t } = useTranslation();

    const columns = [
        {
            title: t("Type"),
            dataIndex: "type",
            key: "confirmation-type",
            render: (value, row) => <div>{row.type}</div>,
        },
        {
            title: t("GENERAL.STATUS"),
            dataIndex: "status",
            key: "confirmation-status",
            render: (value, row) => {
                const status = workflowSelectItemsWithStatus.find((element) => element.value === row.status);
                if (!status) return <div />;
                return (
                    <Row wrap={false} gutter={6}>
                        <Col>
                            <status.StatusIcon />
                        </Col>
                        <Col>{t(status.label)}</Col>
                    </Row>
                );
            },
        },
        {
            title: t("Fill"),
            dataIndex: "fill",
            key: "confirmation-fill",
            render: (value, row) => <div style={{ backgroundColor: row.interiorColor }} className="color-preview" />,
        },
        {
            title: t("Border"),
            dataIndex: "border",
            key: "confirmation-border",
            render: (value, row) => <div style={{ backgroundColor: row.color }} className="color-preview" />,
        },
        {
            title: t("Nr/Tag"),
            dataIndex: "number",
            key: "confirmation-number",
            render: (value, row) => <div>{row.number}</div>,
        },
        {
            title: t("Name"),
            dataIndex: "name",
            key: "confirmation-name",
            render: (value, row) => <div>{row.name}</div>,
        },
        {
            title: t("Changing"),
            dataIndex: "changing",
            key: "confirmation-changing",
            render: () => <div>{t(key)}</div>,
        },
        {
            title: t("Change from"),
            dataIndex: "from",
            key: "confirmation-from",
            render: (value, row) => {
                if (key === "labels") {
                    return <div>{_.get(row.labels, additional.path)}</div>;
                } else return <div>{row[key]?.toString()}</div>;
            },
        },
        {
            title: t("Change to"),
            dataIndex: "to",
            key: "confirmation-to",
            render: () => <div>{value?.toString()}</div>,
        },
    ];

    return (
        <Modal visible={visible} title={t("Multi-edit of Objects")} onOk={onOk} onCancel={onCancel} width={1000}>
            <>
                <p>{t(`You're about to change multiple objects at once, please review the table below for changes to ${annots.length} objects.`)}</p>
                <Table
                    dataSource={annots}
                    columns={columns}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ y: "400px" }}
                    className="Confirmation_Table"
                    rowKey={"id"}
                />
            </>
        </Modal>
    );
};

export default ConfirmationModal;
