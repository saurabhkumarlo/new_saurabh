import { all, create } from "mathjs";

import AnnotationStore from "./AnnotationStore.js";
import CalculationActions from "../actions/CalculationActions.js";
import Immutable from "immutable";
import ProjectsStore from "./ProjectsStore.js";
import { filter, find, findIndex, flatten, forEach, get, groupBy, includes, isEmpty, map, set, some, sortBy } from "lodash";
import { createStore } from "reflux";
import i18n from "../i18nextInitialized.js";
import numeral from "numeral";
import replacements from "../utils/MathjsConfig.js";
import { toMetric } from "../utils/Converison.js";
import { DISPLAY_VALUES_OPTIONS } from "../constants/FeatureConstants.js";
import NodeSocketStore from "./NodeSocketStore.js";
import { ANNOTATION_ROW_ACTION_NAME, GROUP_NAME, ROW_LIBRARY_ACTION_NAME } from "constants/NodeActionsConstants";
import { AuthenticationStore } from "./index.js";
import axios from "axios";
import ObjectsStore from "./ObjectsStore.js";
import _ from "lodash";

const math = create(all, {});

export default createStore({
    listenables: [CalculationActions],
    init() {
        math.import(replacements(math), { override: true });
        this.AnnotationRows = new Immutable.List();
        this.SelectedAnnotationRows = new Immutable.List();
        this.currentRowUnits = new Immutable.Map();
        this.bundledRowsForGui = [];
        this.rowTemplates = [];
        this.annotationsWithRows = [];
        this.rowColumnsVisibilty = JSON.parse(localStorage.getItem("rowColumnsVisibility")) || [
            "profession",
            "phase",
            "segment",
            "action",
            "material",
            "pricePerUnit",
            "unitTime",
            "totalPrice",
            "totalTime",
        ];
    },
    getRowColumnsVisibilty() {
        return this.rowColumnsVisibilty;
    },
    setRowColumnsVisibilty(rowColumnsVisibilty) {
        this.rowColumnsVisibilty = rowColumnsVisibilty;
        this.trigger("rowColumnsVisibiltyUpdated");
    },
    initNumeral() {
        numeral.locale(i18n.language);
    },
    onUpdateRowTemplate(rowTemplates) {
        this.rowTemplates = rowTemplates;
        this.trigger("updateRows");
    },
    onAddRowTemplate(rowTemplates) {
        this.rowTemplates = [...this.rowTemplates, ...rowTemplates];
        this.trigger("updateRows");
    },
    onDeleteRowTemplates(ids) {
        this.rowTemplates = filter(this.rowTemplates, (rowTemplate) => !includes(ids, rowTemplate.id));
        this.trigger("updateRows");
    },
    onUpdateRowTemplates({ ids, parameter, value }) {
        this.rowTemplates = map(this.rowTemplates, (rowTemplate) => (includes(ids, rowTemplate.id) ? { ...rowTemplate, [parameter]: value } : rowTemplate));
    },
    getIntlLang() {
        const currentLang = i18n.language || window.localStorage.language;
        let intlLang;
        switch (currentLang) {
            case "en":
                intlLang = "en-GB";
                break;
            case "sv":
                intlLang = "sv-SE";
                break;
            case "no":
                intlLang = "no-NO";
                break;
            case "da":
                intlLang = "da-DK";
                break;
            case "nl":
                intlLang = "nl-NL";
                break;
            case "es":
                intlLang = "es-ES";
                break;
            default:
                intlLang = "en-US";
                break;
        }
        return intlLang;
    },
    formatNumberValue(value, withGrouping = true) {
        if (!isNaN(value)) return new Intl.NumberFormat(this.getIntlLang(), { maximumFractionDigits: 2, useGrouping: withGrouping }).format(value);
        else return i18n.t("Error in formula");
    },
    formatAmountValue(value, withGrouping = true) {
        if (!isNaN(value))
            return new Intl.NumberFormat(this.getIntlLang(), { maximumFractionDigits: 3, minimumFractionDigits: 3, useGrouping: withGrouping }).format(value);
        else return i18n.t("Error in formula");
    },
    formatCurrencyValue(value, withCurrency = true) {
        if (!isNaN(value))
            if (withCurrency) {
                return new Intl.NumberFormat(this.getIntlLang(), {
                    style: "currency",
                    currency: ProjectsStore.getProjectCurrency(ProjectsStore.getActiveProjectId()),
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                }).format(value);
            } else {
                return new Intl.NumberFormat(this.getIntlLang(), {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                    useGrouping: false,
                }).format(value);
            }
        else if (value === "NaN") return value;
        else return i18n.t("Error in formula");
    },
    getRowTemplates() {
        return this.rowTemplates;
    },
    saveRowTemplate(selectedRows) {
        const rowTemplates = selectedRows.map((row) => {
            return {
                status: row.status?.toString() || "notStarted",
                profession: row.profession?.toString() || "",
                phase: row.phase?.toString() || "",
                segment: row.segment?.toString() || "",
                material: row.material?.toString() || "",
                amount: row.rawAmount?.toString() || "",
                unit: row.unit?.toString() || "",
                pricePerUnit: row.pricePerUnit?.toString() || "",
                timePerUnit: row.unitTime?.toString() || "00:00",
                rowAction: row.action?.toString() || "",
            };
        });
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ROW_LIBRARY, { action: ROW_LIBRARY_ACTION_NAME.CREATE, rowTemplates });
    },
    getNewRowTemplate(part) {
        const splitString = part.split("|");
        if (splitString.length > 1) {
            return {
                status: splitString[0] ? this.transformStatusValue(splitString[0].trim()) : "notStarted",
                profession: splitString[1] ? splitString[1].trim() : "",
                phase: splitString[2] ? splitString[2].trim() : "",
                segment: splitString[3] ? splitString[3].trim() : "",
                rowAction: splitString[4] ? splitString[4].trim() : "",
                material: splitString[5] ? splitString[5].trim() : "",
                amount: splitString[6] ? splitString[6].trim() : "",
                unit: splitString[7] ? splitString[7].trim() : "",
                pricePerUnit: splitString[8] ? splitString[8].trim() : "",
                timePerUnit: this.transformTimePerUnitValue(splitString[9]),
            };
        } else {
            return {
                status: "notStarted",
                profession: "",
                phase: "",
                segment: splitString[0] ? splitString[0].trim() : "",
                rowAction: "",
                material: "",
                amount: "",
                unit: "",
                pricePerUnit: "",
                timePerUnit: "00:00",
            };
        }
    },
    addNewRowTemplate(rowTemplates) {
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ROW_LIBRARY, { action: ROW_LIBRARY_ACTION_NAME.CREATE, rowTemplates });
    },
    requestUpdateRowTemplate(id, parameter, value) {
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ROW_LIBRARY, { action: ROW_LIBRARY_ACTION_NAME.UPDATE, ids: [id], parameter, value });
    },
    getBundledRowsForGui() {
        return this.bundledRowsForGui;
    },
    resetBundledRowsForGui(rows) {
        if (rows) {
            this.bundledRowsForGui = rows.toJS();
        }
    },
    getRowById(id) {
        return this.AnnotationRows.find((row) => {
            return row.get("id") === id;
        });
    },
    getAllRowsForAnnotation(annotation) {
        return this.AnnotationRows.filter((row) => {
            return row.getIn(["geoAnnotation", "id"]) === annotation.get("id");
        });
    },
    getSelectedRows() {
        return this.SelectedAnnotationRows.map((id) => {
            return this.getRowById(id);
        });
    },
    hasRows(id) {
        return this.AnnotationRows.find((row) => {
            return row.getIn(["geoAnnotation", "id"]) === id;
        });
    },
    getRowsForSelectedAnnotations(selectedAnnotations) {
        if (!this.AnnotationRows.isEmpty()) {
            return this.AnnotationRows.filter((row) => {
                return selectedAnnotations.includes(row.getIn(["geoAnnotation", "id"]));
            });
        } else {
            return new Immutable.List();
        }
    },
    getRowsForSelectedAnnotationsV2(selectedAnnotations) {
        const filteredRows = filter(this.annotationsWithRows, (o) => selectedAnnotations.toJS().includes(o?.annotationId));
        const flattenRows = flatten(filteredRows);
        const rows = [];
        forEach(flattenRows, (o) => {
            rows.push(map(o.rows, (p) => ({ id: p.id, geoAnnotation: { id: o.annotationId }, annotationRow: p })));
        });
        return flatten(rows);
    },
    getRowsForSelectedAnnotationsExport(selectedAnnotations) {
        if (!this.AnnotationRows.isEmpty()) {
            return filter(this.AnnotationRows.toJS(), (row) => find(selectedAnnotations.toJS(), (annot) => annot?.id === row?.geoAnnotation?.id));
        } else {
            return [];
        }
    },
    getStatusValue(value) {
        if (value === "notStarted" || value === "progress" || value === "review" || value === "complete") return value;
        else if (value === "2") return "progress";
        else if (value === "3") return "review";
        else if (value === "4") return "complete";
        else return "notStarted";
    },
    getVisibleStatusValue(value) {
        if (value === "progress" || value === "2") return i18n.t("WORKFLOW.IN_PROGRESS");
        else if (value === "review" || value === "3") return i18n.t("WORKFLOW.REVIEW");
        else if (value === "complete" || value === "4") return i18n.t("WORKFLOW.COMPLETE");
        else return i18n.t("WORKFLOW.NOT_STARTED");
    },
    getNumberStatusValue(value) {
        switch (value) {
            case "progress":
                return "2";
            case "review":
                return "3";
            case "complete":
                return "4";
            default:
                return "1";
        }
    },
    transformStatusValue(value) {
        if (value === "2" || value.toLowerCase() === "progress" || value.toLowerCase() === "in progress") return "progress";
        else if (value === "3" || value.toLowerCase() === "review") return "review";
        else if (value === "4" || value.toLowerCase() === "complete") return "complete";
        else return "notStarted";
    },
    transformTimePerUnitValue(value) {
        if (!value) return "00:00";
        const regTime = /^[0-9][0-9]:[0-9][0-9]$/;
        if (regTime.test(value.trim())) return value.trim();
        return "00:00";
    },
    getNewRow(part, id) {
        if (part && id) {
            const splitString = part.split("|");
            if (splitString.length > 1) {
                return {
                    geoAnnotation: { id: id },
                    annotationRow: {
                        rowNumber: this.AnnotationRows.size + 1,
                        status: splitString[0] ? this.transformStatusValue(splitString[0].trim()) : "notStarted",
                        profession: splitString[1] ? splitString[1].trim() : "",
                        phase: splitString[2] ? splitString[2].trim() : "",
                        segment: splitString[3] ? splitString[3].trim() : "",
                        action: splitString[4] ? splitString[4].trim() : "",
                        material: splitString[5] ? splitString[5].trim() : "",
                        amount: splitString[6] ? splitString[6].trim() : "",
                        unit: splitString[7] ? splitString[7].trim() : "",
                        pricePerUnit: splitString[8] ? splitString[8].trim() : "",
                        unitTime: this.transformTimePerUnitValue(splitString[9]),
                        totalPrice: 0,
                        totalTime: "0:00",
                    },
                };
            } else {
                return {
                    geoAnnotation: { id: id },
                    annotationRow: {
                        rowNumber: this.AnnotationRows.size + 1,
                        status: "notStarted",
                        profession: "",
                        phase: "",
                        segment: splitString[0] ? splitString[0].trim() : "",
                        action: "",
                        material: "",
                        amount: "",
                        unit: "",
                        pricePerUnit: "",
                        unitTime: "00:00",
                        totalPrice: 0,
                        totalTime: "0:00",
                    },
                };
            }
        }
        return undefined;
    },
    setSelectedRow(rowsList) {
        this.deSelectAllRows();
        rowsList.forEach((row) => {
            if (row.has("ids")) {
                row.get("ids").forEach((id) => {
                    if (
                        this.SelectedAnnotationRows.findIndex((_id) => {
                            return _id === id;
                        }) === -1
                    ) {
                        this.SelectedAnnotationRows = this.SelectedAnnotationRows.push(id);
                    }
                });
            } else {
                this.SelectedAnnotationRows = this.SelectedAnnotationRows.push(row.get("id"));
            }
        });
        this.trigger("rowSelected");
    },
    deSelectAllRows() {
        this.SelectedAnnotationRows = this.SelectedAnnotationRows.clear();
        this.trigger("rowDeSelected");
    },

    performTimeChainAdd(operand1, operand2) {
        let newValue;
        try {
            if (!operand1) {
                operand1 = "00:00";
            }
            if (!operand2) {
                operand2 = "00:00";
            }

            const split1 = operand1.split(":");
            let hours1 = Number.parseInt(split1[0]);
            let minutes1 = Number.parseInt(split1[1]);
            const split2 = operand2.split(":");
            let hours2 = Number.parseInt(split2[0]);
            let minutes2 = Number.parseInt(split2[1]);
            let totalMinutes1 = minutes1 + 60 * hours1;
            let totalMinutes2 = minutes2 + 60 * hours2;

            const totalMinutes = this.performChainAdd(totalMinutes1, totalMinutes2);
            newValue =
                Math.trunc(totalMinutes / 60) +
                ":" +
                Math.trunc(totalMinutes % 60).toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                });
        } catch (err) {
            newValue = "performTimeChainAdd";
        }
        return newValue;
    },

    formatNumber(value) {
        return value < 10 ? "0" + value.toString() : value.toString();
    },

    performTimeChainMultiply(operand1, operand2) {
        let newValue;
        try {
            if (!operand1) {
                operand1 = "0:0";
            }
            if (!operand2) {
                operand2 = "0";
            }
            const split = operand1.split(":");
            let hours = Number.parseInt(split[0]);
            let minutes = Number.parseInt(split[1]);
            let totalMinutes = minutes + hours * 60;
            totalMinutes = this.performChainMultiply(totalMinutes, operand2);
            hours = Math.trunc(totalMinutes / 60);
            minutes = Math.abs(Math.trunc(totalMinutes % 60));
            newValue = `${totalMinutes < 0 && hours === 0 ? "-" : ""}${hours}:${this.formatNumber(minutes)}`;
        } catch (err) {
            newValue = "performTimeChainMultiply";
        }
        return newValue;
    },

    performChainAdd(operand1, operand2) {
        let newValue = undefined;
        try {
            newValue = math
                .chain(operand1 || 0)
                .add(operand2 || 0)
                .done();
        } catch (err) {
            newValue = i18n.t("Error in formula");
        }
        return newValue;
    },
    performChainMultiply(operand1, operand2) {
        let newValue = undefined;
        try {
            if (!operand1) {
                operand1 = 0;
            }
            if (!operand2) {
                operand2 = 0;
            }
            newValue = math.chain(operand1).multiply(operand2).done();
        } catch (err) {
            newValue = i18n.t("Error in formula");
        }
        return newValue;
    },
    parseExpressionToValues(expression, valuesMap) {
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function translateValue(value, unit) {
            if (value && ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                switch (unit) {
                    case "m":
                        return math.unit(value, unit).to("ft").toNumeric();
                    case "m2":
                        return math.unit(value, unit).to("sqft").toNumeric();
                    case "m3":
                        return math.unit(value, unit).to("cuft").toNumeric();
                    case "st":
                        return value;
                    default:
                        break;
                }
            } else {
                return value;
            }
        }

        if (isNumber(expression)) {
            return expression;
        } else if (
            valuesMap?.get(DISPLAY_VALUES_OPTIONS.EDGES) ||
            valuesMap?.get(DISPLAY_VALUES_OPTIONS.SIDES) ||
            valuesMap?.get(DISPLAY_VALUES_OPTIONS.SIDE_LENGTHS)
        ) {
            const defaultValues = valuesMap.toJS();
            let exp = expression;
            try {
                if (exp) {
                    exp = exp.toLowerCase();
                    const values = {
                        a: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.AREA), "m2"),
                        na: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.NET_AREA), "m2"),
                        vo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.VOLUME), "m3"),
                        nvo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.NET_VOLUME), "m3"),
                    };

                    if (defaultValues[DISPLAY_VALUES_OPTIONS.EDGES]) {
                        defaultValues[DISPLAY_VALUES_OPTIONS.EDGES].forEach((value, index) => (values[`l${index + 1}`] = translateValue(value, "m")));
                    }
                    if (defaultValues[DISPLAY_VALUES_OPTIONS.SIDES]) {
                        defaultValues[DISPLAY_VALUES_OPTIONS.SIDES].forEach((value, index) => (values[`s${index + 1}`] = translateValue(value, "m2")));
                    }
                    if (defaultValues[DISPLAY_VALUES_OPTIONS.SIDE_LENGTHS]) {
                        defaultValues[DISPLAY_VALUES_OPTIONS.SIDE_LENGTHS].forEach((value, index) => (values[`sl${index + 1}`] = translateValue(value, "m")));
                    }

                    if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                        exp = exp.replace(new RegExp('[0-9]+"', "g"), function (match) {
                            return math.unit(toMetric(match), "m").to("ft").toNumeric();
                        });
                        exp = exp.replace(new RegExp("[0-9]+'", "g"), function (match) {
                            return math.unit(toMetric(match), "m").to("ft").toNumeric();
                        });
                    }
                    exp = math.evaluate(exp, values); //.valueOf()
                    if (!isNumber(exp)) {
                        exp = i18n.t("Error in formula");
                    }
                }
            } catch (error) {
                exp = i18n.t("Error in formula");
            }
            if (exp === "") exp = 0;

            return exp;
        } else if (expression && !valuesMap && AnnotationStore.getType() !== "3DModel") {
            return i18n.t("Error in formula");
        } else {
            let exp = expression;
            try {
                if (exp) {
                    exp = exp.toLowerCase();
                    const values = {
                        a: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.AREA), "m2"),
                        l: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.LENGTH), "m"),
                        vo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.VOLUME), "m3"),
                        v: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.TOTAL_WALL), "m2"),
                        na: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.NET_AREA), "m2"),
                        nl: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.NET_LENGTH), "m"),
                        nvo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.NET_VOLUME), "m3"),
                        nv: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.TOTAL_NET_WALL), "m2"),
                        r: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.RED_AREA), "m2"),
                        ra: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.RED_AREA), "m2"),
                        rl: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.RED_LENGTH), "m"),
                        rvo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.RED_VOLUME), "m3"),
                        rv: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.TOTAL_RED_WALL), "m2"),
                        p: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.POINTS), "st"),
                        q: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.COUNT), "st"),
                        h: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.HEIGHT), "m"),
                        dx: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.OUTER_DIM_X) || valuesMap.get(DISPLAY_VALUES_OPTIONS.DIAMETER_X), "m"),
                        dy: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.OUTER_DIM_Y) || valuesMap.get(DISPLAY_VALUES_OPTIONS.DIAMETER_Y), "m"),
                        t: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.AREA_TILES), "st"),
                        jl: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.AREA_JOINT_LENGTH), "m"),
                        jvo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.AREA_JOINT_VOLUME), "m3"),
                        vt: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.WALL_TILES), "st"),
                        vjl: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.WALL_JOINT_LENGTH), "m"),
                        vjvo: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.WALL_JOINT_VOLUME), "m3"),
                        rx: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.RADIUS_X), "m"),
                        ry: translateValue(valuesMap.get(DISPLAY_VALUES_OPTIONS.RADIUS_Y), "m"),
                    };

                    if (valuesMap.has(DISPLAY_VALUES_OPTIONS.LENGTHS) && !valuesMap.get(DISPLAY_VALUES_OPTIONS.LENGTHS).isEmpty()) {
                        valuesMap.get(DISPLAY_VALUES_OPTIONS.LENGTHS).forEach((len, index) => {
                            values["l" + (index + 1)] = translateValue(len, "m");
                        });
                    }
                    if (valuesMap.has(DISPLAY_VALUES_OPTIONS.WALLS) && !valuesMap.get(DISPLAY_VALUES_OPTIONS.WALLS).isEmpty()) {
                        valuesMap.get(DISPLAY_VALUES_OPTIONS.WALLS).forEach((len, index) => {
                            values["v" + (index + 1)] = translateValue(len, "m2");
                        });
                    }
                    if (valuesMap.has(DISPLAY_VALUES_OPTIONS.REDUCTIONS) && !valuesMap.get(DISPLAY_VALUES_OPTIONS.REDUCTIONS).isEmpty()) {
                        valuesMap.get(DISPLAY_VALUES_OPTIONS.REDUCTIONS).forEach((len, index) => {
                            values["r" + (index + 1)] = translateValue(len, "m2");
                        });
                    }
                    if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                        exp = exp.replace(new RegExp('[0-9]+"', "g"), function (match) {
                            return math.unit(toMetric(match), "m").to("ft").toNumeric();
                        });
                        exp = exp.replace(new RegExp("[0-9]+'", "g"), function (match) {
                            return math.unit(toMetric(match), "m").to("ft").toNumeric();
                        });
                    }

                    exp = math.evaluate(exp, values); //.valueOf()

                    if (!isNumber(exp)) {
                        exp = i18n.t("Error in formula");
                    }
                }
            } catch (error) {
                exp = i18n.t("Error in formula");
            }
            if (exp === "") exp = 0;

            return exp;
        }
    },
    convertToFloat(value) {
        if (value === "") return 0;
        return `${value}`.toString().replaceAll(",", ".");
    },
    onRequestCreateRow({ annotationRows, annotationIds, newRows }) {
        if (annotationRows) {
            const rows = map(annotationRows.toJS(), (o) => ({ geoAnnotationId: o.geoAnnotation.id, annotationRow: o.annotationRow }));
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION_ROW, { action: ANNOTATION_ROW_ACTION_NAME.CREATE, annotationRows: rows });
            return true;
        } else if (annotationIds?.length && newRows) {
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION_ROW, {
                action: ANNOTATION_ROW_ACTION_NAME.CREATE,
                annotationRows: newRows,
                annotationIds,
            });
        } else {
            return false;
        }
    },
    onRequestPasteRows(annotationListIds, rowListIds) {
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION_ROW, {
            action: ANNOTATION_ROW_ACTION_NAME.CREATE,
            annotationIds: annotationListIds,
            rowIds: rowListIds,
        });
    },
    onRequestUpdateRow(newAnnotationRow, cell, value) {
        if (newAnnotationRow) {
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION_ROW, {
                action: ANNOTATION_ROW_ACTION_NAME.UPDATE,
                ids: newAnnotationRow.toJS().ids || [newAnnotationRow.toJS().id],
                key: cell,
                value,
            });
        } else {
            return false;
        }
    },
    onRequestDeleteRowsForAnnotations(annotations) {
        if (annotations) {
            let payload = {
                ids: [],
            };
            annotations.forEach((annot) => {
                const annotationRowsToDelete = this.getAllRowsForAnnotation(annot);
                if (!annotationRowsToDelete.isEmpty()) {
                    const annotationRowIds = annotationRowsToDelete.map((annotationRow) => {
                        return annotationRow.get("id");
                    });
                    payload.ids = payload.ids.concat(annotationRowIds.toJS());
                }
            });
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION_ROW, { action: ANNOTATION_ROW_ACTION_NAME.DELETE, ids: payload.ids });
        }
    },
    onRequestDeleteSelectedRows(rows) {
        if (rows.length) {
            const rowIds = _.map(rows, (row) => row.id);
            if (rowIds.length) NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION_ROW, { action: ANNOTATION_ROW_ACTION_NAME.DELETE, ids: rowIds });
        }
    },

    onGeoRowLibraryMessageHandler(response) {
        const { CREATE, DELETE, UPDATE } = ROW_LIBRARY_ACTION_NAME;
        const { action, payload } = response;

        switch (action) {
            case CREATE:
                this.onAddRowTemplate(payload.rowTemplates);
                break;
            case DELETE:
                this.onDeleteRowTemplates(payload.ids);
                break;
            case UPDATE:
                const { ids, parameter, value } = payload;
                this.onUpdateRowTemplates({ ids, parameter, value });
                break;
            default:
                break;
        }
    },
    onGeoAnnotationRowMessageHandler(response) {
        const { CREATE, DELETE, UPDATE } = ANNOTATION_ROW_ACTION_NAME;
        const { action, payload } = response;

        switch (action) {
            case CREATE:
                const {
                    annotationRowsIdRange: { startId, endId },
                } = payload;
                axios
                    .get(`${process.env.REACT_APP_NODE_URL}/annotationRows`, {
                        headers: {
                            Authorization: AuthenticationStore.getJwt(),
                        },
                        params: { startId, endId },
                    })
                    .then((response) => {
                        ObjectsStore.onRowsCreate(response.data);
                        this.trigger("CalculationRowInserted");
                    })
                    .catch((err) => console.log(err));
                break;
            case UPDATE:
                ObjectsStore.onRowsUpdate(payload);
                this.trigger("CalculationRowUpdated");
                break;
            case DELETE:
                ObjectsStore.onRowsDelete(payload.rows);
                this.trigger("CalculationRowDeleted");
                break;
            default:
                break;
        }
    },
    updateReadOnlyRows({ annotationIds, value }) {
        forEach(this.annotationsWithRows, (annotationWithRows) => {
            if (annotationIds.includes(annotationWithRows.annotationId)) {
                const updatedRows = map(annotationWithRows.rows, (row) => ({ ...row, readOnly: value }));
                annotationWithRows.rows = updatedRows;
            }
        });
    },
});
