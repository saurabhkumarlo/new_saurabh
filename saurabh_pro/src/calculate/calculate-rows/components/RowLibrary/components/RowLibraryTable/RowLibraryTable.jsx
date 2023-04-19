import "./rowlibrary.less";

import { AuthenticationStore, CalculationStore } from "../../../../../../stores";
import { Autocomplete, Input, Select, ContextMenu, FilterDropdown } from "../../..";
import { Divider, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Immutable from "immutable";
import React from "react";
import { map } from "lodash";
import { onSorterLibrary } from "../../../../CalculateRows.utils";
import { withTranslation } from "react-i18next";
import { workflowSelectItemsWithStatus } from "calculate/calculate/components/CalculateProperties/CalculateProperties.utils";

class RowLibraryTable extends React.PureComponent {
    state = {
        isDropdownOpen: false,
        selectedRowKeys: [],
        selectedRows: [],
        savedRows: [],
        filterState: [],
    };

    unitData = [
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

    componentDidMount() {
        this.unsubscribeCalculationStore = CalculationStore.listen(this.calculationStoreUpdated);

        this.setState({ savedRows: CalculationStore.getRowTemplates() });
    }

    componentWillUnmount() {
        this.unsubscribeCalculationStore();
    }

    calculationStoreUpdated = (message, value = undefined) => {
        switch (message) {
            case "updateRows":
                this.setState({ savedRows: CalculationStore.getRowTemplates(), isDropdownOpen: false });
                break;
            default:
                break;
        }
    };

    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
        this.props.setSelectedLibraryRows(selectedRows);
    };

    generateRowLibraryBody = (data) => {
        return map(data, (row) => ({ id: row.id, userId: row.userId, rowAction: row.rowAction, annotationRow: { ...row } }));
    };

    clearSelectedRows = () => {
        this.setState({ selectedRowKeys: [], selectedRows: [] });
        this.props.setSelectedLibraryRows([]);
        CalculationStore.deSelectAllRows();
    };

    onChangeFilterState = (selectedValues, key, clearFilter) => {
        const { filterState } = this.state;
        let newActiveFilters = [];
        const shouldUpdateFilter = filterState.some((filterObj) => filterObj.key === key);
        if (clearFilter) newActiveFilters = filterState.filter((filterObj) => filterObj.key !== key);
        else
            newActiveFilters = shouldUpdateFilter
                ? filterState.map((filterObj) => (filterObj.key === key ? { key, selectedValues } : filterObj))
                : [...filterState, { key, selectedValues }];
        this.setState({ filterState: newActiveFilters });
    };
    render() {
        const { t } = this.props;
        const { selectedRowKeys, selectedRows } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: (record) => ({
                disabled: record.name === "Disabled User",
                // Column configuration not to be checked
                name: record.name,
            }),
        };

        const savedColumns = [
            {
                title: t("GENERAL.STATUS"),
                dataIndex: "status",
                key: "status",
                sorter: (a, b) => onSorterLibrary("status", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="status"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.status.indexOf(value) === 0,
                render: (value, row) => <Select data={workflowSelectItemsWithStatus} row={row} object="status" initialValue={row.status} isLibrary={true} />,
            },
            {
                title: t("ESTIMATE.PROFESSION"),
                dataIndex: "profession",
                key: "profession",
                sorter: (a, b) => onSorterLibrary("profession", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="profession"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.profession.indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="profession" initialValue={row.profession} isLibrary={true} />,
            },
            {
                title: t("ESTIMATE.PHASE"),
                dataIndex: "phase",
                key: "phase",
                sorter: (a, b) => onSorterLibrary("phase", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="phase"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.phase.indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="phase" initialValue={row.phase} isLibrary={true} />,
            },
            {
                title: t("ESTIMATE.SEGMENT"),
                dataIndex: "segment",
                key: "segment",
                sorter: (a, b) => onSorterLibrary("segment", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="segment"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.segment.indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="segment" initialValue={row.segment} isLibrary={true} />,
            },
            {
                title: t("ESTIMATE.ACTION"),
                dataIndex: "rowAction",
                key: "rowAction",
                sorter: (a, b) => onSorterLibrary("rowAction", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="rowAction"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.rowAction.indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="rowAction" initialValue={row.rowAction} isLibrary={true} />,
            },
            {
                title: t("ESTIMATE.MATERIAL"),
                dataIndex: "material",
                key: "material",
                sorter: (a, b) => onSorterLibrary("material", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="material"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.material.indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="material" initialValue={row.material} isLibrary={true} />,
            },
            {
                title: t("GENERAL.AMOUNT"),
                dataIndex: "amount",
                key: "amount",
                sorter: (a, b) => onSorterLibrary("amount", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="amount"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.amount.toString().indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="amount" initialValue={row.amount} rightAlign isLibrary={true} />,
            },
            {
                title: t("GENERAL.UNIT"),
                dataIndex: "unit",
                key: "unit",
                sorter: (a, b) => onSorterLibrary("unit", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="unit"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.unit.indexOf(value) === 0,
                render: (value, row) => <Autocomplete options={this.unitData} row={row} object="unit" initialValue={row.unit} isLibrary={true} />,
            },
            {
                title: t("GENERAL.UNIT_PRICE"),
                dataIndex: "pricePerUnit",
                key: "pricePerUnit",
                sorter: (a, b) => onSorterLibrary("pricePerUnit", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="pricePerUnit"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.pricePerUnit.indexOf(value) === 0,
                render: (value, row) => <Input row={row} object="pricePerUnit" initialValue={row.pricePerUnit} rightAlign isLibrary={true} />,
            },
            {
                title: t("GENERAL.UNIT_TIME"),
                dataIndex: "timePerUnit",
                key: "timePerUnit",
                sorter: (a, b) => onSorterLibrary("timePerUnit", a, b),
                filterDropdown: (event) => (
                    <FilterDropdown
                        object="timePerUnit"
                        annotationRows={this.generateRowLibraryBody(this.state.savedRows)}
                        event={event}
                        onChangeFilters={this.onChangeFilterState}
                        filterState={this.state.filterState}
                    />
                ),
                filterIcon: () => <FontAwesomeIcon icon={["fal", "filter"]} />,
                onFilter: (value, record) => record.timePerUnit.indexOf(value) === 0,
                render: (value, row) => (
                    <Input row={row} object="timePerUnit" type="time" initialValue={row.timePerUnit || "00:00"} rightAlign isLibrary={true} />
                ),
            },
        ];

        const role = AuthenticationStore.getRole();

        return (
            <>
                <div className="Library_Container">
                    <ContextMenu
                        role={role}
                        type="library"
                        selectedRowsProp={new Immutable.List(selectedRows)}
                        selectedRowKeys={selectedRowKeys}
                        clearSelectedRows={this.clearSelectedRows}
                    >
                        <div>
                            <div>{t("ESTIMATE.STORED_ROWS")}</div>
                            <Divider />
                            <Table
                                showSorterTooltip={{ title: t("GENERAL.TOOLTIP.CHANGE_SORT_ORDER") }}
                                dataSource={this.state.savedRows}
                                columns={savedColumns}
                                pagination={false}
                                rowSelection={rowSelection}
                                bordered
                                size="small"
                                rowKey={(record) => {
                                    return `${record.id}`;
                                }}
                                className="Library_Table"
                            />
                        </div>
                    </ContextMenu>
                </div>
            </>
        );
    }
}

export default withTranslation()(RowLibraryTable);
