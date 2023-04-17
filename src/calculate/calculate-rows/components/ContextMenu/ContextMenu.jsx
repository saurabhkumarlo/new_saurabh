import "./contextmenu.less";

import { Button, Divider, Dropdown, Menu } from "antd";
import { GROUP_NAME, ROW_LIBRARY_ACTION_NAME } from "constants/NodeActionsConstants";
import { Modal, ReplaceRowsDialog } from "../../../../components";
import React, { useEffect, useState } from "react";

import CalculationStore from "../../../../stores/CalculationStore";
import { DeleteTable } from "../";
import EventsStore from "../../../../stores/EventsStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NodeSocketStore, ObjectsStore } from "stores";
import RowCopyStore from "../../../../stores/RowCopyStore";
import { map } from "lodash";
import { useTranslation } from "react-i18next";
import Immutable from "immutable";

const ContextMenu = ({ role, children, type, selectedRowsProp, selectedRowKeys, selectedAnnotationsProp, clearSelectedRows, onPasteRowsToMultipleObjects }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
    const [selectedRows, setSelectedRows] = useState(selectedRowsProp);
    const [selectedAnnotations, setSelectedAnnotations] = useState(selectedAnnotationsProp);
    const { t } = useTranslation();

    useEffect(() => {
        setSelectedRows(selectedRowsProp);
    }, [selectedRowsProp]);

    useEffect(() => {
        setSelectedAnnotations(selectedAnnotationsProp);
    }, [selectedAnnotationsProp]);

    const onVisibleDropdownChange = (value) => {
        setIsDropdownOpen(value);
        EventsStore.setContextMenuCalculateRowsOpen(value);
    };

    const onCopy = () => {
        const rowsToCopy = selectedRows.map((row) => {
            row.amount = row.rawAmount;
            delete row.rawAmount;
            return row;
        });

        RowCopyStore.copySelectedRows(rowsToCopy);
        setIsDropdownOpen(false);
        EventsStore.setContextMenuCalculateRowsOpen(false);
    };

    const isPasteButtonDisabled = () => {
        if (selectedAnnotations.length === 0) return true;
        else if (RowCopyStore.getCopyAnnotationRows().length === 0) return true;
        else return false;
    };

    const onPaste = () => {
        selectedAnnotations.length > 0 ? onPasteRowsToMultipleObjects() : RowCopyStore.pasteAnnotationRows(selectedAnnotations);
        setIsDropdownOpen(false);
        EventsStore.setContextMenuCalculateRowsOpen(false);
    };

    const onSave = () => {
        CalculationStore.saveRowTemplate(selectedRows);
        setIsDropdownOpen(false);
        EventsStore.setContextMenuCalculateRowsOpen(false);
    };

    const onShowReplaceConfirmation = () => {
        setShowReplaceConfirmation(true);
        setIsDropdownOpen(false);
        EventsStore.setContextMenuCalculateRowsOpen(false);
    };

    const onReplace = () => {
        RowCopyStore.replaceSelectedRows(selectedAnnotations, ObjectsStore.getSeparateBundledRows(selectedRows));
        setShowReplaceConfirmation(false);
    };

    const onCancelReplace = () => {
        setShowReplaceConfirmation(false);
        clearSelectedRows();
    };

    const onDelete = () => {
        if (type === "library") {
            const ids = map(selectedRowKeys, (key) => Number(key));
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ROW_LIBRARY, { action: ROW_LIBRARY_ACTION_NAME.DELETE, ids });
            clearSelectedRows();
        } else setShowDeleteConfirmation(true);

        setIsDropdownOpen(false);
        EventsStore.setContextMenuCalculateRowsOpen(false);
    };

    const onDeleteRows = () => {
        if (type === "library") {
            const ids = map(selectedRowKeys, (key) => Number(key));
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ROW_LIBRARY, { action: ROW_LIBRARY_ACTION_NAME.DELETE, ids });
        } else CalculationStore.onRequestDeleteSelectedRows(ObjectsStore.getSeparateBundledRows(selectedRows));

        setShowDeleteConfirmation(false);
        clearSelectedRows();
    };

    const onCancelDeleteRows = () => {
        setShowDeleteConfirmation(false);
        clearSelectedRows();
    };

    const generateRowLibraryBody = (data) => {
        return map(data, (row) => ({ id: row.id, userId: row.userId, rowAction: row.rowAction, annotationRow: { ...row } }));
    };

    const menu =
        type !== "library" ? (
            <Menu className="Calculate_Rows_ContextMenu">
                <Menu.Item key="1" onClick={onCopy} disabled={!role || selectedRows.length === 0}>
                    <FontAwesomeIcon icon={["fal", "copy"]} />
                    {t("GENERAL.COPY")}
                </Menu.Item>
                <Menu.Item key="2" onClick={onPaste} disabled={!role || isPasteButtonDisabled()}>
                    <FontAwesomeIcon icon={["fal", "paste"]} />
                    {t("GENERAL.PASTE")}
                </Menu.Item>
                <Menu.Item key="3" onClick={onShowReplaceConfirmation} disabled={!role || isPasteButtonDisabled()}>
                    <FontAwesomeIcon icon={["fal", "sync"]} />
                    {t("GENERAL.REPLACE")}
                </Menu.Item>
                <Divider />
                <Menu.Item key="4" onClick={onSave} disabled={!role || selectedRows.length === 0}>
                    <FontAwesomeIcon icon={["fal", "save"]} />
                    {t("GENERAL.SAVE")}
                </Menu.Item>
                <Divider />
                <Menu.Item key="5" onClick={onDelete} disabled={!role || selectedRows.length === 0} danger>
                    <FontAwesomeIcon icon={["fal", "trash"]} />
                    {t("GENERAL.DELETE")}
                </Menu.Item>
            </Menu>
        ) : (
            <Menu className="Calculate_Rows_ContextMenu">
                <Menu.Item key="1" onClick={onDelete} danger disabled={!role || selectedRows.length === 0}>
                    <FontAwesomeIcon icon={["fal", "trash"]} />
                    {t("GENERAL.DELETE")}
                </Menu.Item>
            </Menu>
        );

    return (
        <>
            {showDeleteConfirmation && (
                <Modal
                    visible={showDeleteConfirmation}
                    title={type === "library" ? t("ESTIMAATE.DELETE_STORED_ROWS") : t("ESTIMATE.DELETE_ROWS")}
                    onOk={onDeleteRows}
                    onCancel={onCancelDeleteRows}
                    cancelText={t("GENERAL.CANCEL")}
                    activeButtons={
                        <Button onClick={onDeleteRows} type="primary" danger autoFocus>
                            {t("GENERAL.DELETE")}
                        </Button>
                    }
                    className="Calculate_Modal"
                >
                    <DeleteTable data={type === "library" ? generateRowLibraryBody(selectedRows) : selectedRows} />
                </Modal>
            )}
            {showReplaceConfirmation && (
                <Modal
                    visible={showReplaceConfirmation}
                    title={t("ESTIMATE.REPLACE_ROWS_IN_CURRENT_SELECTION")}
                    onOk={onReplace}
                    onCancel={onCancelReplace}
                    submitButtonTitle={t("GENERAL.REPLACE")}
                    cancelText={t("GENERAL.CANCEL")}
                    className="Calculate_Modal"
                >
                    <ReplaceRowsDialog oldData={selectedRows} newData={RowCopyStore.getCopyAnnotationRows()} />
                </Modal>
            )}
            <Dropdown
                overlay={menu}
                trigger={["contextMenu"]}
                visible={role && isDropdownOpen}
                onVisibleChange={onVisibleDropdownChange}
                className="Dropdown_Container"
            >
                {children}
            </Dropdown>
        </>
    );
};

export default ContextMenu;
