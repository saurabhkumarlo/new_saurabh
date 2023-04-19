import { Col, Row, Table } from "antd";

import { CalculationStore } from "../../stores";
import React from "react";
import { useTranslation } from "react-i18next";
import { workflowSelectItemsWithStatus } from "calculate/calculate/components/CalculateProperties/CalculateProperties.utils";

const ReplaceRowsDialog = ({ oldData, newData }) => {
    const { t } = useTranslation();

    const selectedColumns = [
        {
            title: t("GENERAL.STATUS"),
            dataIndex: "status",
            key: "status",
            render: (value, row) => {
                const status = workflowSelectItemsWithStatus.find((element) => element.value === row.status);
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
            title: t("ESTIMATE.PROFESSION"),
            dataIndex: "profession",
            key: "profession",
            render: (value, row) => <div>{row.profession}</div>,
        },
        {
            title: t("ESTIMATE.PHASE"),
            dataIndex: "phase",
            key: "phase",
            render: (value, row) => <div>{row.phase}</div>,
        },
        {
            title: t("ESTIMATE.SEGMENT"),
            dataIndex: "segment",
            key: "segment",
            render: (value, row) => <div>{row.segment}</div>,
        },
        {
            title: t("ESTIMATE.ACTION"),
            dataIndex: "action",
            key: "action",
            render: (value, row) => <div>{row.action}</div>,
        },
        {
            title: t("ESTIMATE.MATERIAL"),
            dataIndex: "material",
            key: "material",
            render: (value, row) => <div>{row.material}</div>,
        },
        {
            title: t("GENERAL.AMOUNT"),
            dataIndex: "amount",
            key: "amount",
            render: (value, row) => {
                return <div className="Right_Align">{row.rawAmount}</div>;
            },
        },
        {
            title: t("GENERAL.UNIT"),
            dataIndex: "unit",
            key: "unit",
            render: (value, row) => <div>{row.unit}</div>,
        },
        {
            title: t("GENERAL.UNIT_PRICE"),
            dataIndex: "pricePerUnit",
            key: "pricePerUnit",
            render: (value, row) => <div className="Right_Align">{CalculationStore.formatCurrencyValue(row.pricePerUnit)}</div>,
        },
        {
            title: t("GENERAL.UNIT_TIME"),
            dataIndex: "unitTime",
            key: "unitTime",
            render: (value, row) => <div className="Right_Align">{row.unitTime || "00:00"}</div>,
        },
        {
            title: t("GENERAL.TOTAL_PRICE"),
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (value, row) => <div className="Right_Align">{CalculationStore.formatCurrencyValue(row.totalPrice)}</div>,
        },
        {
            title: t("GENERAL.TOTAL_TIME"),
            dataIndex: "totalTime",
            key: "totalTime",
            render: (value, row) => {
                const hoursAndMinutes = row.totalTime.split(":");
                return (
                    <div className="Right_Align">
                        {!isNaN(hoursAndMinutes[0]) || !isNaN(hoursAndMinutes[1]) ? `${hoursAndMinutes[0]}:${hoursAndMinutes[1]}` : "0:00"}
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <Table
                dataSource={oldData}
                columns={selectedColumns}
                pagination={false}
                bordered
                size="small"
                className="Calculate_Rows_Table"
                scroll={{ y: "200px" }}
            />
            <p>{t("GENERAL.WILL_BE_REPLACED_BY")}</p>
            <Table
                dataSource={newData}
                columns={selectedColumns}
                pagination={false}
                bordered
                size="small"
                className="Calculate_Rows_Table"
                scroll={{ y: "200px" }}
            />
        </div>
    );
};

export default ReplaceRowsDialog;
