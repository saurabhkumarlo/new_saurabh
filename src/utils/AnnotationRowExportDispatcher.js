import { HEADLINES, RowsExportOptions } from "./../constants";

import AbstractExportDispatcher from "./AbstractExportDispatcher";
import AnnotationStore from "./../stores/AnnotationStore";
import CalculationRowExportFactory from "./CalculationRowExportFactory";
import CalculationRowFieldsFactory from "./CalculationRowFieldsFactory";
import Immutable from "immutable";

export default class AnnotationRowExportDispatcher extends AbstractExportDispatcher {
    dispatch(exportType) {
        const fieldsFactory = new CalculationRowFieldsFactory();
        const calcRowExportFactory = new CalculationRowExportFactory();
        let fields = new Immutable.List();
        let data = new Immutable.List();
        let headlineData = undefined;
        switch (exportType) {
            case RowsExportOptions.Rows_Selection:
                data = calcRowExportFactory.getAnnotationRowsFullList();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = fieldsFactory.getAnnotationRowsFullFields(calcRowExportFactory.getPathLength());
                break;
            case RowsExportOptions.Rows_Net_Selection:
                data = calcRowExportFactory.getSelectionRowSum();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = fieldsFactory.getAnnotionTotalRowsSumFields(calcRowExportFactory.getPathLength());
                break;
            case RowsExportOptions.Rows_Sum_Per_Folder_Everything:
                data = calcRowExportFactory.getAnnototationRowsSumFolderList();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = fieldsFactory.getAnnototationRowsSumFolderFields(calcRowExportFactory.getPathLength());
                break;
            case RowsExportOptions.BidCon_Everything:
                data = calcRowExportFactory.getBidconExportList();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]).set("exportData", undefined);
                fields = fieldsFactory.getBidconExportFields();
                break;
            default:
                console.log("Export did not handle case for annotation row: " + exportType);
        }
        let dataWrapper = new Immutable.Map();
        dataWrapper = dataWrapper.set("fields", fields).set("data", data).set("headlineData", headlineData);
        dataWrapper = dataWrapper.set("data", data);
        return dataWrapper;
    }
}
