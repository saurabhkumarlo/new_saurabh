import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { getRow, parseString, propertiesColumns } from "./CalculationTable.utils";
import { CalculationStore, ObjectsStore } from "stores";
import { List } from "react-virtualized";
import _, { isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { ANNOT_TYPES, ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";
import { Input } from "calculate/calculate/components/CalculateProperties/components";
import { getSelectedAnnotations } from "calculate/calculate/components/CalculateProperties/CalculateProperties.utils";

import "./calculation-table.less";

const CalculationTable = ({ selectedAnnotations, splitPosRight, onChangeValues, isPreventEditing }) => {
    const { t } = useTranslation();
    const isEveryIFC = _.every(selectedAnnotations, ["type", ANNOT_TYPES.IFC_MODEL]);
    const [listData, setListData] = useState([]);
    const [formulaValue, setFormulaValue] = useState();
    const [formulaVariable, setFormulaVariable] = useState();
    const [clickedRowKey, setClickedRowKey] = useState();

    useEffect(() => {
        isEveryIFC && getBasicValueTable();
        setFormulaValue();
        setFormulaVariable();
        setClickedRowKey();
    }, [selectedAnnotations]);

    const getListHeight = () => window.innerHeight / 2 - 140;

    const getBasicValueTable = () => {
        if (!selectedAnnotations.length) return [];

        const tableData = [];
        let key = 1;
        const annotationDataObject = ObjectsStore.getSumCalculateValues();

        if (annotationDataObject) {
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.ANNOTATIONS"] > 1) {
                const row = getRow(key++, "", t("GENERAL.OBJECTS"), annotationDataObject["ESTIMATE.ANNOTATION_VALUES.ANNOTATIONS"]);
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA"])) {
                const row = getRow(
                    key++,
                    "A",
                    t("ESTIMATE.AREA"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA"]),
                    "m²"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.LENGTH"])) {
                const row = getRow(
                    key++,
                    "L",
                    t("ESTIMATE.LENGTH"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.LENGTH"]),
                    "m"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.VOLUME"])) {
                const row = getRow(
                    key++,
                    "VO",
                    t("ESTIMATE.VOLUME"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.VOLUME"]),
                    "m³"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL"])) {
                const row = getRow(
                    key++,
                    "V",
                    t("ESTIMATE.WALL"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL"]),
                    "m²"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_AREA"])) {
                const row = getRow(
                    key++,
                    "NA",
                    t("ESTIMATE.NET_AREA"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_AREA"]),
                    "m²"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_LENGTH"])) {
                const row = getRow(
                    key++,
                    "NL",
                    t("ESTIMATE.NET_LENGTH"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_LENGTH"]),
                    "m"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_VOLUME"])) {
                const row = getRow(
                    key++,
                    "NVO",
                    t("ESTIMATE.NET_VOLUME"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_VOLUME"]),
                    "m³"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_WALL"])) {
                const row = getRow(
                    key++,
                    "NV",
                    t("ESTIMATE.NET_WALL"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.NET_WALL"]),
                    "m²"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.POINTS"])) {
                const row = getRow(
                    key++,
                    "P",
                    t("ESTIMATE.POINTS"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.POINTS"]),
                    t("GENERAL.PCS")
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RADIUS_X"])) {
                const row = getRow(
                    key++,
                    "RX",
                    t("ESTIMATE.RADIUS_X"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RADIUS_X"]),
                    "m"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RADIUS_Y"])) {
                const row = getRow(
                    key++,
                    "RY",
                    t("ESTIMATE.RADIUS_Y"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RADIUS_Y"]),
                    "m"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.DIAMETER_X"])) {
                const row = getRow(
                    key++,
                    "DX",
                    t("ESTIMATE.DIAMETER_X"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.DIAMETER_X"]),
                    "m"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y"])) {
                const row = getRow(
                    key++,
                    "DY",
                    t("ESTIMATE.DIAMETER_Y"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y"]),
                    "m"
                );
                tableData.push(row);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.EDGES"])) {
                const data = annotationDataObject["ESTIMATE.ANNOTATION_VALUES.EDGES"];
                const edgesArr = data.map((value, index) =>
                    getRow(key++, `L${index + 1}`, t("ESTIMATE.LENGTH_COUNT", { count: index + 1 }), CalculationStore.formatAmountValue(value), "m")
                );
                tableData.push(...edgesArr);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.SL"])) {
                const data = annotationDataObject["ESTIMATE.ANNOTATION_VALUES.SL"];
                const slArr = data.map((value, index) =>
                    getRow(key++, `SL${index + 1}`, t("ESTIMATE.SIDE_LENGTH", { count: index + 1 }), CalculationStore.formatAmountValue(value), "m")
                );
                tableData.push(...slArr);
            }
            if (!isNil(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.S"])) {
                const data = annotationDataObject["ESTIMATE.ANNOTATION_VALUES.S"];
                const sArr = data.map((value, index) =>
                    getRow(key++, `S${index + 1}`, t("ESTIMATE.SIDE", { count: index + 1 }), CalculationStore.formatAmountValue(value), "m²")
                );
                tableData.push(...sArr);
            }
        }

        const addData = getDetailedValuesTable();
        isEveryIFC && setListData(tableData.concat(addData));
        return tableData.concat(addData);
    };

    const getDetailedValuesTable = () => {
        if (!selectedAnnotations.length) return [];

        const tableData = [];
        let key = 100;
        const annotationDataObject = ObjectsStore.getSumCalculateValues();

        if (annotationDataObject) {
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X"]) {
                const row = getRow(
                    key++,
                    "DX",
                    t("ESTIMATE.OUTER_DIM_X"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X"]),
                    "m"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y"]) {
                const row = getRow(
                    key++,
                    "DY",
                    t("ESTIMATE.OUTER_DIM_Y"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y"]),
                    "m"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA_TILES"]) {
                const row = getRow(
                    key++,
                    "T",
                    t("ESTIMATE.NET_AREA_TILES"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA_TILES"]),
                    t("ESTIMATE.PCS")
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_LENGTH"]) {
                const row = getRow(
                    key++,
                    "JL",
                    t("ESTIMATE.NET_AREA_JOIN_LENGTH"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_LENGTH"]),
                    "m"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_VOLUME"]) {
                const row = getRow(
                    key++,
                    "JVO",
                    t("ESTIMATE.NET_AREA_JOINT_VOLUME"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_VOLUME"]),
                    "m³"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL_TILES"]) {
                const row = getRow(
                    key++,
                    "VT",
                    t("ESTIMATE.NET_WALL_TILES"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL_TILES"]),
                    t("ESTIMATE.PCS")
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_LENGTH"]) {
                const row = getRow(
                    key++,
                    "VJL",
                    t("ESTIMATE.NET_WALL_JOIN_LENGTH"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_LENGTH"]),
                    "m"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_VOLUME"]) {
                const row = getRow(
                    key++,
                    "VJVO",
                    t("ESTIMATE.NET_WALL_JOIN_VOLUME"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_VOLUME"]),
                    "m³"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_AREA"]) {
                const row = getRow(
                    key++,
                    "RA",
                    t("ESTIMATE.REDUCTION_AREA"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_AREA"]),
                    "m²"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_LENGTH"]) {
                const row = getRow(
                    key++,
                    "RL",
                    t("ESTIMATE.REDUCTION_LENGTH"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_LENGTH"]),
                    "m"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_VOLUME"]) {
                const row = getRow(
                    key++,
                    "RVO",
                    t("ESTIMATE.REDUCTION_VOLUME"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_VOLUME"]),
                    "m³"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_WALL"]) {
                const row = getRow(
                    key++,
                    "RV",
                    t("ESTIMATE.REDUCTION_WALL"),
                    CalculationStore.formatAmountValue(annotationDataObject["ESTIMATE.ANNOTATION_VALUES.RED_WALL"]),
                    "m²"
                );
                tableData.push(row);
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.LENGTHS"]) {
                const lengths = annotationDataObject["ESTIMATE.ANNOTATION_VALUES.LENGTHS"];
                lengths.forEach((lengthValue, index) => {
                    const row = getRow(
                        key++,
                        "L" + (index + 1) + "",
                        t("ESTIMATE.LENGTH_COUNT", { count: index + 1 }),
                        CalculationStore.formatAmountValue(lengthValue),
                        "m"
                    );
                    tableData.push(row);
                });
            }
            if (annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALLS"]) {
                const walls = annotationDataObject["ESTIMATE.ANNOTATION_VALUES.WALLS"];
                walls.forEach((wallValue, index) => {
                    const row = getRow(
                        key++,
                        "V" + (index + 1) + "",
                        t("ESTIMATE.WALL_COUNT", { count: index + 1 }),
                        CalculationStore.formatAmountValue(wallValue),
                        "m²"
                    );
                    tableData.push(row);
                });
            }
        }
        return tableData;
    };

    const onFormulaChange = (value) => {
        const parsedFormula = parseString(String(value));
        let key;
        switch (formulaVariable) {
            case "NA":
                key = ANNOT_ATTRIBUTES.FORMULA_NA;
                break;
            case "NL":
                key = ANNOT_ATTRIBUTES.FORMULA_NL;
                break;
            case "NVO":
                key = ANNOT_ATTRIBUTES.FORMULA_NVO;
                break;
            case "NV":
                key = ANNOT_ATTRIBUTES.FORMULA_NV;
                break;
            default:
                break;
        }
        onChangeValues(getSelectedAnnotations(selectedAnnotations, false, false), parsedFormula, key);
    };

    const formatValueColumn = (text, record) => {
        if (record.variable.includes("NA") || record.variable.includes("NL") || record.variable.includes("NVO") || record.variable.includes("NV")) {
            const regex = /^[A-Z]+$/;
            const result = record.variable.match(regex);

            if (clickedRowKey && clickedRowKey.key === record.key) {
                return <Input obj="formulaValue" value={formulaValue} onUpdate={onFormulaChange} autoFocus textAlign="right" disabled={isPreventEditing} />;
            }
            switch (result && result[0]) {
                case "NA":
                    if (selectedAnnotations.some((annot) => annot.formulaNA)) {
                        return (
                            <div className="Data_Table_Value_Editable_With_Formula">
                                {text} {record.unit}
                            </div>
                        );
                    }
                    break;
                case "NL":
                    if (selectedAnnotations.some((annot) => annot.formulaNL)) {
                        return (
                            <div className="Data_Table_Value_Editable_With_Formula">
                                {text} {record.unit}
                            </div>
                        );
                    }
                    break;
                case "NVO":
                    if (selectedAnnotations.some((annot) => annot.formulaNVO)) {
                        return (
                            <div className="Data_Table_Value_Editable_With_Formula">
                                {text} {record.unit}
                            </div>
                        );
                    }
                    break;
                case "NV":
                    if (selectedAnnotations.some((annot) => annot.formulaNV)) {
                        return (
                            <div className="Data_Table_Value_Editable_With_Formula">
                                {text} {record.unit}
                            </div>
                        );
                    }
                    break;
                default:
                    break;
            }
            return (
                <div className="Data_Table_Value_Editable">
                    {text} {record.unit}
                </div>
            );
        }
        return (
            <div>
                {text} {record.unit}
            </div>
        );
    };

    const onRowClick = (e, isRecord = false) => {
        let data = null;
        if (isRecord) data = e;
        else {
            try {
                data = JSON.parse(e.currentTarget.getAttribute("data-row"));
            } catch (error) {
                console.log("On row click error: ", error);
            }
        }

        if (!isPreventEditing && data) {
            setClickedRowKey(data);
            setFormulaVariable(data.variable);
            const formula = `formula${data.variable}`;
            const formulaAnnot = selectedAnnotations.find((annot) => annot[formula]);
            setFormulaValue(formulaAnnot && formulaAnnot[formula]);
        }
    };

    const rowRenderer = (rowInfo) => {
        const { key, style, index } = rowInfo;
        return (
            <div key={key} style={style} className="rowList" data-row={JSON.stringify(listData[index])} onClick={onRowClick}>
                <div>
                    <label>{listData[index].variable}</label>
                    <label>{listData[index].part}</label>
                </div>
                <div>{formatValueColumn(listData[index].value, listData[index])}</div>
            </div>
        );
    };

    return (
        <div className="Calculation_Table_Wrapper">
            {isEveryIFC ? (
                <List
                    width={+splitPosRight - 34}
                    rowRenderer={rowRenderer}
                    rowHeight={31}
                    rowCount={listData.length}
                    height={getListHeight()}
                    overscanRowCount={10}
                />
            ) : (
                <Table
                    dataSource={getBasicValueTable()}
                    columns={propertiesColumns(formatValueColumn)}
                    pagination={false}
                    size="middle"
                    onRow={(record) => ({ onClick: () => onRowClick(record, true) })}
                />
            )}
        </div>
    );
};

export default CalculationTable;
