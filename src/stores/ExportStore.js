import { createStore } from "reflux";
import i18n from "./../i18nextInitialized.js";
import json2csv from "json2csv";
import AnnotationExportDispatcher from "./../utils/AnnotationExportDispatcher";
import AnnotationRowExportDispatcher from "../utils/AnnotationRowExportDispatcher";

// No actions or init used
export default createStore({
    exportCalcRowsToClipboard(exportType) {
        const dispatcher = new AnnotationRowExportDispatcher();
        const dataWrapper = dispatcher.dispatch(exportType);
        if (dataWrapper.getIn(["headlineData", "exportData"])) {
            return dataWrapper.setIn(
                ["headlineData", "exportData"],
                dataWrapper
                    .getIn(["headlineData", "exportData"])
                    .concat("\n" + json2csv({ data: dataWrapper.get("data"), fields: dataWrapper.get("fields"), del: "\t" }))
            );
        } else {
            return dataWrapper.setIn(["headlineData", "exportData"], json2csv({ data: dataWrapper.get("data"), fields: dataWrapper.get("fields"), del: "\t" }));
        }
    },
    exportCalcRowsToCSV(exportType) {
        const dispatcher = new AnnotationRowExportDispatcher();
        const dataWrapper = dispatcher.dispatch(exportType);
        if (
            i18n.language.indexOf("sv") !== -1 ||
            i18n.language.indexOf("no") !== -1 ||
            i18n.language.indexOf("nn") !== -1 ||
            i18n.language.indexOf("nb") !== -1 ||
            i18n.language.indexOf("da") !== -1 ||
            i18n.language.indexOf("nl") !== -1
        ) {
            if (dataWrapper.getIn(["headlineData", "exportData"])) {
                return dataWrapper.setIn(
                    ["headlineData", "exportData"],
                    dataWrapper
                        .getIn(["headlineData", "exportData"])
                        .concat("\n" + json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields"), del: ";" }))
                );
            }
            return dataWrapper.setIn(
                ["headlineData", "exportData"],
                json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields"), del: ";" })
            );
        } else {
            if (dataWrapper.getIn(["headlineData", "exportData"])) {
                return dataWrapper.setIn(
                    ["headlineData", "exportData"],
                    dataWrapper
                        .getIn(["headlineData", "exportData"])
                        .concat("\n" + json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields") }))
                );
            }
            return dataWrapper.setIn(["headlineData", "exportData"], json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields") }));
        }
    },
    exportAnnotationsToClipboard(exportType) {
        const dispatcher = new AnnotationExportDispatcher();
        const dataWrapper = dispatcher.dispatch(exportType);

        if (dataWrapper.getIn(["headlineData", "exportData"])) {
            return dataWrapper.setIn(
                ["headlineData", "exportData"],
                dataWrapper
                    .getIn(["headlineData", "exportData"])
                    .concat("\n" + json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields"), del: "\t" }))
            );
        } else {
            return dataWrapper.setIn(
                ["headlineData", "exportData"],
                json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields"), del: "\t" })
            );
        }
    },
    exportAnnotationsToCsv(type) {
        const dispatcher = new AnnotationExportDispatcher();
        const dataWrapper = dispatcher.dispatch(type);

        if (
            i18n.language.indexOf("sv") !== -1 ||
            i18n.language.indexOf("no") !== -1 ||
            i18n.language.indexOf("nn") !== -1 ||
            i18n.language.indexOf("nb") !== -1 ||
            i18n.language.indexOf("da") !== -1 ||
            i18n.language.indexOf("nl") !== -1
        ) {
            if (dataWrapper.getIn(["headlineData", "exportData"])) {
                return dataWrapper.setIn(
                    ["headlineData", "exportData"],
                    dataWrapper
                        .getIn(["headlineData", "exportData"])
                        .concat("\n" + json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields"), del: ";" }))
                );
            }
            return dataWrapper.setIn(
                ["headlineData", "exportData"],
                json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields"), del: ";" })
            );
        } else {
            if (dataWrapper.getIn(["headlineData", "exportData"])) {
                return dataWrapper.setIn(
                    ["headlineData", "exportData"],
                    dataWrapper
                        .getIn(["headlineData", "exportData"])
                        .concat("\n" + json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields") }))
                );
            }
            return dataWrapper.setIn(["headlineData", "exportData"], json2csv({ data: dataWrapper.get("data").toJS(), fields: dataWrapper.get("fields") }));
        }
    },
});
