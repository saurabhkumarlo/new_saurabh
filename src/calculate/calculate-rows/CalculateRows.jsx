import "./calculate-rows.less";

import { AnnotationStore, AuthenticationStore, CalculationStore, IfcStore, ObjectsStore, RowCopyStore } from "../../stores";
import { Autocomplete, ContextMenu, RowLibrary, TotalTimeAndPrice } from "./components";
import { Button, Col, Row, Table, Tooltip } from "antd";
import { ErrorFallback, Modal } from "../../components";
import _ from "lodash";

import { CalculationActions } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Immutable from "immutable";
import React from "react";
import { getRowColumns } from "./CalculateRows.utils";
import { withTranslation } from "react-i18next";

class CalculateRows extends React.PureComponent {
    state = {
        selectedRowKeys: [],
        selectedRows: [],
        annotationRows: [],
        selectedAnnotations: [],
        showConfirmDialog: false,
        showLibrary: false,
        selectedLibraryRows: [],
        newRow: "",
        isNewRowOpen: false,
        filterState: JSON.parse(localStorage.getItem("calculateRows::filter")) || [],
        pasteRowsAction: false,
        rowColumnsVisibilty: CalculationStore.getRowColumnsVisibilty(),
    };

    componentWillMount() {
        this.unsubscribeCalculationStore = CalculationStore.listen(this.calculationStoreUpdated);
        this.unsubscribeAnnotationStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeIfcStore = IfcStore.listen(this.ifcStoreUpdated);
        CalculationStore.initNumeral();
    }

    componentWillUnmount() {
        this.unsubscribeCalculationStore();
        this.unsubscribeAnnotationStore();
        this.unsubscribeIfcStore();
    }

    calculationStoreUpdated = (message) => {
        switch (message) {
            case "CalculationRowInserted":
            case "CalculationRowDeleted":
            case "CalculationRowsFetched":
            case "CalculationRowUpdated":
                this.setState({ annotationRows: ObjectsStore.getBundledRows() });
                break;
            case "rowColumnsVisibiltyUpdated":
                this.setState({ rowColumnsVisibilty: CalculationStore.getRowColumnsVisibilty() });
                break;
            default:
                break;
        }
    };

    annotationStoreUpdated = (message) => {
        switch (message) {
            case "annotationSelected":
            case "AnnotationUpdated":
            case "annotationSelectedFromGui":
            case "annotationDeSelectedFromGui":
                const { selectionList } = ObjectsStore.getSelectionList();
                this.clearSelectedRows();
                this.setState({ annotationRows: ObjectsStore.getBundledRows(), selectedAnnotations: selectionList });
                break;
            default:
                break;
        }
    };

    ifcStoreUpdated = (message) => {
        if (message === "ifcAnnotationsUpdated") this.setState({ annotationRows: ObjectsStore.getBundledRows() });
    };

    selectRow = (row) =>
        this.setState({
            selectedRow: row,
        });

    addNewRow = () => {
        const { selectedAnnotations, showLibrary } = this.state;

        if (selectedAnnotations.length > 1) this.setState({ showConfirmDialog: true });
        else {
            if (!showLibrary) {
                const annotationIds = _.map(selectedAnnotations, (annot) => {
                    if (!annot.readOnly) return annot.id;
                });
                if (annotationIds.length) {
                    const newAnnotationRow = CalculationStore.getNewRow(this.state.newRow, annotationIds[0]);
                    const newRow = { ...newAnnotationRow, annotationRow: JSON.stringify(newAnnotationRow.annotationRow) };
                    this.setState({
                        newRow: "",
                        isNewRowOpen: false,
                    });
                    CalculationActions.requestCreateRow({ annotationIds: annotationIds, newRows: [newRow] });
                }
            } else {
                const newRowTemplate = CalculationStore.getNewRowTemplate(this.state.newRow);
                CalculationStore.addNewRowTemplate([newRowTemplate]);
            }
            this.setState({
                newRow: "",
                isNewRowOpen: false,
            });
        }
    };

    insertRows = () => {
        const { selectedAnnotations, selectedLibraryRows } = this.state;
        const copiedSelectedRows = JSON.parse(JSON.stringify(selectedLibraryRows));
        const parsedRows = _.map(copiedSelectedRows, (annotationRow) => {
            annotationRow.action = annotationRow.rowAction;
            annotationRow.unitTime = annotationRow.timePerUnit;
            delete annotationRow.rowAction;
            delete annotationRow.timePerUnit;
            delete annotationRow.id;
            return { annotationRow: JSON.stringify(annotationRow) };
        });
        const annotationIds = _.map(selectedAnnotations, (annot) => {
            if (!annot.readOnly) return annot.id;
        });

        CalculationActions.requestCreateRow({ annotationIds, newRows: parsedRows });
        this.setState({ showLibrary: false });
    };

    submitConfirmDialog = () => {
        const { selectedAnnotations, pasteRowsAction, showLibrary } = this.state;
        if (pasteRowsAction) {
            RowCopyStore.pasteAnnotationRows(selectedAnnotations);
            this.setState({ showConfirmDialog: false, pasteRowsAction: false });
            return;
        }

        if (showLibrary) this.insertRows();
        else {
            const annotationIds = _.map(selectedAnnotations, (annot) => {
                if (!annot.readOnly) return annot.id;
            });

            const newRow = CalculationStore.getNewRow(this.state.newRow, annotationIds[0]);
            CalculationStore.onRequestCreateRow({
                annotationIds,
                newRows: [{ annotationRow: JSON.stringify(newRow.annotationRow) }],
            });
        }

        this.setState({ showConfirmDialog: false, newRow: "" });
    };

    cancelConfirmDialog = () => this.setState({ showConfirmDialog: false, newRow: "" });

    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeys,
            selectedRows,
        });
        ObjectsStore.setSelectedRows(selectedRows);
    };

    clearSelectedRows = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRows: [],
            newRow: "",
        });
        ObjectsStore.clearSelectedRows();
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

        localStorage.setItem("calculateRows::filter", JSON.stringify(newActiveFilters));
        this.setState({ filterState: newActiveFilters });
    };

    getVisibleRow = (rowColumns) => {
        const visibleColumns = ["status", "amount", "unit", ...this.state.rowColumnsVisibilty];
        const filteredColumns = rowColumns.filter((column) => visibleColumns.some((key) => key === column.key));

        return AuthenticationStore.getRole()
            ? filteredColumns
            : filteredColumns.filter((column) => column.key !== "totalPrice" && column.key !== "pricePerUnit");
    };

    onPasteRowsToMultipleObjectsHandler = () => {
        this.setState({ showConfirmDialog: true, pasteRowsAction: true });
    };

    setSelectedLibraryRows = (selectedLibraryRows) => this.setState({ selectedLibraryRows });
    setIsNewRowOpen = (isNewRowOpen) => this.setState({ isNewRowOpen });
    onShowLibraryClick = () => this.setState({ showLibrary: !this.state.showLibrary, showHints: false, newRow: "" });
    setNewRow = (newRow) => this.setState({ newRow });
    showConfirmDialog = (value) => this.setState({ showConfirmDialog: value });
    onRowClick = (row) => ({ onClick: () => this.selectRow(row) });
    onButtonClick = () => this.setState({ showLibrary: !this.state.showLibrary, showHints: false, newRow: "" });
    onInputKeyDown = (e) => {
        if (e.key === "Enter" && this.state.newRow) this.addNewRow();
    };
    onDropdownVisibleChange = (value) => this.setState({ isNewRowOpen: value });
    onAutoCompleteChange = (value) => this.setState({ newRow: value });
    onAutoCompleteBlur = () => this.setState({ isNewRowOpen: false });

    render() {
        const role = AuthenticationStore.getRole();
        const { t } = this.props;
        const {
            selectedRows,
            selectedRowKeys,
            showLibrary,
            annotationRows,
            selectedAnnotations,
            showConfirmDialog,
            newRow,
            isNewRowOpen,
            filterState,
            selectedLibraryRows,
        } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: (record) => ({
                disabled: record.name === "Disabled User",
                name: record.name,
            }),
        };
        const columns = this.getVisibleRow(
            getRowColumns({
                t,
                filterState: filterState,
                annotationRows,
                onChangeFilterState: this.onChangeFilterState,
            })
        );
        const isInsertRowDisable = !role || selectedAnnotations.length === 0 || _.some(selectedAnnotations, (annot) => annot.readOnly);

        return (
            <>
                {showConfirmDialog && (
                    <Modal
                        visible={showConfirmDialog}
                        title={t("ESTIMATE.INSERT_ROWS_TO_MULTIPLE_OBJECTS")}
                        submitButtonTitle={t("ESTIMATE.INSERT_ROWS")}
                        onOk={this.submitConfirmDialog}
                        onPressEnter={this.submitConfirmDialog}
                        onCancel={this.cancelConfirmDialog}
                        width={284}
                    >
                        <p>{t("ESTIMATE.MESSAGE.INSERT_ROWS_TO_MULTIPLE_OBJECTS")}</p>
                    </Modal>
                )}
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <div className="Calculate_Rows_Container">
                        {showLibrary ? (
                            <RowLibrary
                                setSelectedLibraryRows={this.setSelectedLibraryRows}
                                newRow={newRow}
                                isNewRowOpen={isNewRowOpen}
                                addNewRow={this.addNewRow}
                                selectedLibraryRows={selectedLibraryRows}
                                selectedAnnotations={selectedAnnotations}
                                setIsNewRowOpen={this.setIsNewRowOpen}
                                onShowLibraryClick={this.onShowLibraryClick}
                                setNewRow={this.setNewRow}
                                insertRows={this.insertRows}
                                showConfirmDialog={this.showConfirmDialog}
                                isInsertRowDisable={isInsertRowDisable}
                            />
                        ) : (
                            <>
                                <ContextMenu
                                    role={role}
                                    selectedRowsProp={selectedRows}
                                    selectedAnnotationsProp={selectedAnnotations}
                                    clearSelectedRows={this.clearSelectedRows}
                                    onPasteRowsToMultipleObjects={this.onPasteRowsToMultipleObjectsHandler}
                                >
                                    <div>
                                        <Table
                                            showSorterTooltip={{ title: t("GENERAL.TOOLTIP.CHANGE_SORT_ORDER") }}
                                            dataSource={annotationRows}
                                            columns={columns}
                                            pagination={false}
                                            rowSelection={rowSelection}
                                            bordered
                                            scroll={{ x: "max-content" }}
                                            size="small"
                                            onRow={this.onRowClick}
                                            rowKey={(record) => `${record.id}`}
                                            className="Calculate_Rows_Table"
                                        />
                                    </div>
                                </ContextMenu>
                                <Row wrap={false} className="Calculate_Rows_Add_Wrapper" gutter={4} align="bottom">
                                    <Col>
                                        <Tooltip placement="top" title={<span>{t("GENERAL.TOOLTIP.ROWS_LIBRARY")}</span>}>
                                            <Button
                                                className={`Calculate_Rows_Button_Icon`}
                                                onClick={this.onButtonClick}
                                                icon={<FontAwesomeIcon icon={["fal", "book"]} />}
                                                disabled={!role}
                                                type="text"
                                            />
                                        </Tooltip>
                                    </Col>
                                    <Col flex="auto">
                                        <Autocomplete
                                            value={newRow}
                                            open={isNewRowOpen}
                                            object="insertRow"
                                            showAction={["click"]}
                                            disabled={isInsertRowDisable}
                                            isLibrary={false}
                                            placeholder={t("ESTIMATE.INSERT_ROW_PLACEHOLDER")}
                                            onInputKeyDown={this.onInputKeyDown}
                                            onDropdownVisibleChange={this.onDropdownVisibleChange}
                                            onChange={this.onAutoCompleteChange}
                                            onBlur={this.onAutoCompleteBlur}
                                            className="Calculate_Rows_Add_Row"
                                        />
                                    </Col>
                                    <TotalTimeAndPrice annotationRows={annotationRows} filterState={filterState} />
                                </Row>
                            </>
                        )}
                    </div>
                </ErrorBoundary>
            </>
        );
    }
}

export default withTranslation()(CalculateRows);
