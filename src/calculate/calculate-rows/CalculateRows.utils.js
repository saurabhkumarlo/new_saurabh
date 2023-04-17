import React from "react";
import { CalculationStore, AnnotationStore, AuthenticationStore, ObjectsStore } from "../../stores";
import { find, get } from "lodash";
import { Autocomplete, FilterDropdown, Input, Select } from "./components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { workflowSelectItemsWithStatus } from "calculate/calculate/components/CalculateProperties/CalculateProperties.utils";

const isEstimateLocked = get(AnnotationStore.ActiveEstimate?.toJS(), "locked");

const unitData = [
    {
        value: "m",
        label: "m",
    },
    {
        value: "m2",
        label: "m2",
    },
    {
        value: "m3",
        label: "m3",
    },
    {
        value: "st",
        label: "st",
    },
];

export const onSorter = (object, a, b) => {
    if (object === "status") {
        const _a = CalculationStore.getNumberStatusValue(a.status);
        const _b = CalculationStore.getNumberStatusValue(b.status);
        return _a.localeCompare(_b);
    } else if (object === "amount" || object === "pricePerUnit" || object === "totalPrice") {
        return a[object] - b[object];
    } else {
        return a[object].localeCompare(b[object], undefined, { numeric: true });
    }
};

export const onSorterLibrary = (object, a, b) => {
    if (object === "status") {
        const _a = CalculationStore.getNumberStatusValue(a.status);
        const _b = CalculationStore.getNumberStatusValue(b.status);
        return _a.localeCompare(_b);
    } else if (object === "pricePerUnit") {
        return a[object] - b[object];
    } else {
        return a[object].localeCompare(b[object], undefined, { numeric: true });
    }
};

export const transformExtendedValue = (value, rowData) => {
    const annot = ObjectsStore.getAnnotationByPDFTronAnnot({ geoEstimateId: rowData.estimateId, geoFileId: rowData.fileId, geoAnnotId: rowData.id });
    const annotData = annot.annotationData;

    return CalculationStore.parseExpressionToValues(value, annotData);
};

export const getRowColumns = ({ t, filterState, annotationRows, onChangeFilterState }) => {
    const role = AuthenticationStore.getRole();

    return [
        {
            title: t("GENERAL.STATUS"),
            dataIndex: "status",
            key: "status",
            sorter: (a, b) => onSorter("status", a, b),
            filteredValue: find(filterState, { key: "status" })?.selectedValues,
            filterDropdown: (event) => (
                <FilterDropdown object="status" annotationRows={annotationRows} event={event} onChangeFilters={onChangeFilterState} filterState={filterState} />
            ),
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Select
                    data={workflowSelectItemsWithStatus}
                    row={row}
                    object="status"
                    initialValue={row.status || "notStarted"}
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                />
            ),
            width: "30px",
        },
        {
            title: t("ESTIMATE.PROFESSION"),
            dataIndex: "profession",
            key: "profession",
            sorter: (a, b) => onSorter("profession", a, b),
            filteredValue: find(filterState, { key: "profession" })?.selectedValues,
            filterDropdown: (event) => (
                <FilterDropdown
                    object="profession"
                    annotationRows={annotationRows}
                    event={event}
                    onChangeFilters={onChangeFilterState}
                    filterState={filterState}
                />
            ),
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.profession.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete
                    row={row}
                    object="profession"
                    disable={!role}
                    initialValue={row.profession}
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                />
            ),
            width: "100px",
        },
        {
            title: t("ESTIMATE.PHASE"),
            dataIndex: "phase",
            key: "phase",
            sorter: (a, b) => onSorter("phase", a, b),
            filteredValue: find(filterState, { key: "phase" })?.selectedValues,
            filterDropdown: (event) => (
                <FilterDropdown object="phase" annotationRows={annotationRows} event={event} onChangeFilters={onChangeFilterState} filterState={filterState} />
            ),
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.phase.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete row={row} object="phase" disable={!role} initialValue={row.phase} checkRowIsDisable={isEstimateLocked || row.readOnly} />
            ),
            width: "80px",
        },
        {
            title: t("ESTIMATE.SEGMENT"),
            dataIndex: "segment",
            key: "segment",
            sorter: (a, b) => onSorter("segment", a, b),
            filteredValue: find(filterState, { key: "segment" })?.selectedValues,
            filterDropdown: (event) => (
                <FilterDropdown
                    object="segment"
                    annotationRows={annotationRows}
                    event={event}
                    onChangeFilters={onChangeFilterState}
                    filterState={filterState}
                />
            ),
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.segment.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete row={row} object="segment" disable={!role} initialValue={row.segment} checkRowIsDisable={isEstimateLocked || row.readOnly} />
            ),
            width: "150px",
        },
        {
            title: t("ESTIMATE.ACTION"),
            dataIndex: "action",
            key: "action",
            sorter: (a, b) => onSorter("action", a, b),
            filteredValue: find(filterState, { key: "action" })?.selectedValues,
            filterDropdown: (event) => (
                <FilterDropdown object="action" annotationRows={annotationRows} event={event} onChangeFilters={onChangeFilterState} filterState={filterState} />
            ),
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.action.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete row={row} object="action" disable={!role} initialValue={row.action} checkRowIsDisable={isEstimateLocked || row.readOnly} />
            ),
            width: "150px",
        },
        {
            title: t("ESTIMATE.MATERIAL"),
            dataIndex: "material",
            key: "material",
            sorter: (a, b) => onSorter("material", a, b),
            filteredValue: find(filterState, { key: "material" })?.selectedValues,
            filterDropdown: (event) => <FilterDropdown object="material" annotationRows={annotationRows} event={event} onChangeFilters={onChangeFilterState} />,
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.material.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete row={row} object="material" disable={!role} initialValue={row.material} checkRowIsDisable={isEstimateLocked || row.readOnly} />
            ),
            width: "150px",
        },
        {
            title: t("GENERAL.AMOUNT"),
            dataIndex: "amount",
            key: "amount",
            sorter: (a, b) => onSorter("amount", a, b),
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete
                    extended
                    row={row}
                    object="amount"
                    disable={!role}
                    initialValue={row.rawAmount}
                    extendedValue={CalculationStore.formatAmountValue(row.amount)}
                    rightAlign
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                />
            ),
            width: "100px",
        },
        {
            title: t("GENERAL.UNIT"),
            dataIndex: "unit",
            key: "unit",
            sorter: (a, b) => onSorter("unit", a, b),
            filteredValue: find(filterState, { key: "unit" })?.selectedValues,
            filterDropdown: (event) => <FilterDropdown object="unit" annotationRows={annotationRows} event={event} onChangeFilters={onChangeFilterState} />,
            filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
            onFilter: (value, record) => record.unit.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete
                    options={unitData}
                    row={row}
                    object="unit"
                    disable={!role}
                    initialValue={row.unit}
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                />
            ),
            width: "50px",
        },
        {
            title: t("GENERAL.UNIT_PRICE"),
            dataIndex: "pricePerUnit",
            key: "pricePerUnit",
            sorter: (a, b) => onSorter("pricePerUnit", a, b),
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Autocomplete
                    extended
                    row={row}
                    object="pricePerUnit"
                    disable={!role}
                    initialValue={row.pricePerUnit}
                    extendedValue={CalculationStore.formatCurrencyValue(row.pricePerUnit)}
                    rightAlign
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                />
            ),
            width: "100px",
        },
        {
            title: t("GENERAL.UNIT_TIME"),
            dataIndex: "unitTime",
            key: "unitTime",
            sorter: (a, b) => onSorter("unitTime", a, b),
            onFilter: (value, record) => record.unitTime.indexOf(value) === 0,
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Input
                    row={row}
                    object="unitTime"
                    disable={!role}
                    type="time"
                    initialValue={row.unitTime || "00:00"}
                    rightAlign
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                />
            ),
            width: "50px",
        },
        {
            title: t("GENERAL.TOTAL_PRICE"),
            dataIndex: "totalPrice",
            key: "totalPrice",
            sorter: (a, b) => onSorter("totalPrice", a, b),
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => (
                <Input
                    row={row}
                    readOnly
                    object="totalPrice"
                    disable={!role}
                    style={{ textAlign: "right" }}
                    initialValue={CalculationStore.formatCurrencyValue(row.totalPrice)}
                    checkRowIsDisable={isEstimateLocked || row.readOnly}
                    className="Calculate_Rows_Input"
                />
            ),
            width: "120px",
        },
        {
            title: t("GENERAL.TOTAL_TIME"),
            dataIndex: "totalTime",
            key: "totalTime",
            sorter: (a, b) => onSorter("totalTime", a, b),
            shouldCellUpdate: (record, prevRecord) => JSON.stringify(record) !== JSON.stringify(prevRecord),
            render: (value, row) => {
                const hoursAndMinutes = row.totalTime.split(":");
                return (
                    <Input
                        row={row}
                        readOnly
                        object="totalTime"
                        disable={!role}
                        style={{ textAlign: "right" }}
                        initialValue={!isNaN(hoursAndMinutes[0]) || !isNaN(hoursAndMinutes[1]) ? `${hoursAndMinutes[0]}:${hoursAndMinutes[1]}` : "0:00"}
                        checkRowIsDisable={isEstimateLocked || row.readOnly}
                        className="Calculate_Rows_Input"
                    />
                );
            },
            width: "70px",
        },
    ];
};
