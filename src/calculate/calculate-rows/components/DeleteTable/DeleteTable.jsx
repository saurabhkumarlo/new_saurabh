import React, { useEffect, useState } from "react";
import { Table, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { CalculationStore, ObjectsStore } from "../../../../stores";
import { workflowSelectItemsWithStatus } from "calculate/calculate/components/CalculateProperties/CalculateProperties.utils";

const DeleteTable = ({ data }) => {
    const { t } = useTranslation();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        setRows(ObjectsStore.getSeparateBundledRows(data));
        return () => setRows([]);
    }, []);

    const selectedColumns = [
        {
            title: t("Name"),
            dataIndex: "name",
            key: "name-delete",
            render: (value, row) => {
                return <div>{row.geoAnnotation.name}</div>;
            },
        },
        {
            title: t("Nr/Tag"),
            dataIndex: "number",
            key: "number-delete",
            render: (value, row) => {
                return <div>{row.geoAnnotation.number}</div>;
            },
        },
        {
            title: t("Status"),
            dataIndex: "status",
            key: "status-delete",
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
            title: t("Profession"),
            dataIndex: "profession",
            key: "profession-delete",
            render: (value, row) => <div>{row.profession}</div>,
        },
        {
            title: t("Phase"),
            dataIndex: "phase",
            key: "phase-delete",
            render: (value, row) => <div>{row.phase}</div>,
        },
        {
            title: t("Segment"),
            dataIndex: "segment",
            key: "segment-delete",
            render: (value, row) => <div>{row.segment}</div>,
        },
        {
            title: t("Action"),
            dataIndex: "action",
            key: "action-delete",
            render: (value, row) => <div>{row.action}</div>,
        },
        {
            title: t("Material"),
            dataIndex: "material",
            key: "material-delete",
            render: (value, row) => <div>{row.material}</div>,
        },
        {
            title: t("Amount"),
            dataIndex: "amount",
            key: "amount-delete",
            render: (value, row) => <div className="Right_Align">{CalculationStore.formatAmountValue(row.amount)}</div>,
        },
        {
            title: t("Unit"),
            dataIndex: "unit",
            key: "unit-delete",
            render: (value, row) => <div>{row.unit}</div>,
        },
        {
            title: t("Unit Price"),
            dataIndex: "pricePerUnit",
            key: "pricePerUnit-delete",
            render: (value, row) => <div className="Right_Align">{CalculationStore.formatCurrencyValue(row.pricePerUnit)}</div>,
        },
        {
            title: t("Unit Time"),
            dataIndex: "unitTime",
            key: "unitTime-delete",
            render: (value, row) => <div className="Right_Align">{row.unitTime || "00:00"}</div>,
        },
    ];
    return (
        <Table dataSource={rows} columns={selectedColumns} pagination={false} bordered size="small" className="Calculate_Rows_Table" scroll={{ y: "250px" }} />
    );
};

export default DeleteTable;
