import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Row, Tooltip } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { AuthenticationStore, CalculationStore } from "stores";
import { Autocomplete } from "..";
import { RowLibraryTable } from "./components";

const RowLibrary = ({
    setSelectedLibraryRows,
    newRow,
    isNewRowOpen,
    addNewRow,
    selectedLibraryRows,
    selectedAnnotations,
    setIsNewRowOpen,
    onShowLibraryClick,
    setNewRow,
    insertRows,
    showConfirmDialog,
    isInsertRowDisable,
}) => {
    const { t } = useTranslation();
    const role = AuthenticationStore.getRole();

    const isInsertButtonDisabled = () => {
        if (selectedLibraryRows.length === 0) return true;
        else if (selectedAnnotations.length === 0) return true;
        else return false;
    };
    const onInsert = () => (selectedAnnotations.length > 1 ? showConfirmDialog(true) : insertRows());
    const onBlur = () => setIsNewRowOpen(false);
    const onAccept = (e) => {
        if (e.key === "Enter" && newRow) addNewRow();
    };

    return (
        <>
            <RowLibraryTable setSelectedLibraryRows={setSelectedLibraryRows} />
            <Row wrap={false} className="Calculate_Rows_Add_Wrapper" gutter={4} align="bottom">
                <Col>
                    <Tooltip placement="top" title={<span>{t("GENERAL.TOOLTIP.ROWS_LIBRARY")}</span>}>
                        <Button
                            className={`Calculate_Rows_Button_Icon Calculate_Rows_Button_Icon--active`}
                            onClick={onShowLibraryClick}
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
                        isLibrary={true}
                        placeholder={t("ESTIMATE.INSERT_ROW_PLACEHOLDER")}
                        onInputKeyDown={onAccept}
                        onDropdownVisibleChange={setIsNewRowOpen}
                        onChange={setNewRow}
                        onBlur={onBlur}
                        className="Calculate_Rows_Add_Row"
                    />
                </Col>
                <Col>
                    <Button
                        className={`Calculate_Rows_Button_Icon Calculate_Rows_Insert_Button`}
                        type="primary"
                        disabled={isInsertButtonDisabled()}
                        onClick={onInsert}
                    >
                        {t("GENERAL.INSERT")}
                    </Button>
                </Col>
            </Row>
        </>
    );
};

export default RowLibrary;
