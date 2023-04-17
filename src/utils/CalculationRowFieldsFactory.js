import { ROWS, ANNOTS } from "../constants";
import i18n from "./../i18nextInitialized";

export default class CalculationRowFieldsFactory {
    constructor() {}

    getAnnotationRowsFullFields(pathLength) {
        let dynamicFields = [i18n.t(ROWS.ID)];
        let i;
        for (i = 1; i <= pathLength; i++) {
            dynamicFields.push(i18n.t(ANNOTS.GROUP_FOLDER) + " " + i);
        }
        const standardFields = [
            i18n.t(ANNOTS.NUMBER),
            i18n.t(ANNOTS.NAME),
            i18n.t(ROWS.STATUS),
            i18n.t(ROWS.PROFESSION),
            i18n.t(ROWS.PHASE),
            i18n.t(ROWS.SEGMENT),
            i18n.t(ROWS.ACTION),
            i18n.t(ROWS.MATERIAL),
            i18n.t(ROWS.AMOUNT),
            i18n.t(ROWS.UNIT),
            i18n.t(ROWS.UNIT_PRICE),
            i18n.t(ROWS.UNIT_TIME),
            i18n.t(ROWS.TOTAL_PRICE),
            i18n.t(ROWS.TOTAL_TIME),
            i18n.t(ROWS.FORMULA),
            i18n.t(ROWS.CURRENCY),
            i18n.t(ANNOTS.FILE_NAME),
        ];
        return dynamicFields.concat(standardFields);
    }

    getAnnototationRowsSumFolderFields(pathLength) {
        let dynamicFields = [i18n.t(ROWS.ID)];
        let i;
        for (i = 1; i <= pathLength; i++) {
            dynamicFields.push(i18n.t(ANNOTS.GROUP_FOLDER) + " " + i);
        }
        const standardFields = [
            i18n.t(ROWS.STATUS),
            i18n.t(ROWS.PROFESSION),
            i18n.t(ROWS.PHASE),
            i18n.t(ROWS.SEGMENT),
            i18n.t(ROWS.ACTION),
            i18n.t(ROWS.MATERIAL),
            i18n.t(ROWS.AMOUNT),
            i18n.t(ROWS.UNIT),
            i18n.t(ROWS.UNIT_PRICE),
            i18n.t(ROWS.UNIT_TIME),
            i18n.t(ROWS.TOTAL_PRICE),
            i18n.t(ROWS.TOTAL_TIME),
            i18n.t(ROWS.CURRENCY),
            i18n.t(ROWS.OBJECTS),
        ];
        return dynamicFields.concat(standardFields);
    }

    getAnnotionTotalRowsSumFields() {
        const standardFields = [
            i18n.t(ROWS.ID),
            i18n.t(ROWS.STATUS),
            i18n.t(ROWS.PROFESSION),
            i18n.t(ROWS.PHASE),
            i18n.t(ROWS.SEGMENT),
            i18n.t(ROWS.ACTION),
            i18n.t(ROWS.MATERIAL),
            i18n.t(ROWS.AMOUNT),
            i18n.t(ROWS.UNIT),
            i18n.t(ROWS.UNIT_PRICE),
            i18n.t(ROWS.UNIT_TIME),
            i18n.t(ROWS.TOTAL_PRICE),
            i18n.t(ROWS.TOTAL_TIME),
            i18n.t(ROWS.FORMULA),
            i18n.t(ROWS.CURRENCY),
            i18n.t(ROWS.OBJECTS),
        ];
        return standardFields;
    }

    getBidconExportFields() {
        // Nummer (Tag)	Namn	Del(Rad)	Mängd	Enhet	Pris/enh
        // Per mapp summerade rader för annoteringar  i varje mapp ej nedåt
        // Rubriker enligt lista nedan, hårdkodade
        // Produktionskod	Kalkyldel	Benämning	Mängd	Enhet	Á-pris/enh
        const bidConFields = [
            i18n.t(ANNOTS.NUMBER),
            i18n.t(ANNOTS.NAME),
            i18n.t(ROWS.STATUS),
            i18n.t(ROWS.PROFESSION),
            i18n.t(ROWS.PHASE),
            i18n.t(ROWS.SEGMENT),
            i18n.t(ROWS.ACTION),
            i18n.t(ROWS.MATERIAL),
            i18n.t(ROWS.AMOUNT),
            i18n.t(ROWS.UNIT),
            i18n.t(ROWS.UNIT_PRICE),
            i18n.t(ROWS.UNIT_TIME),
            i18n.t(ROWS.TOTAL_PRICE),
            i18n.t(ROWS.TOTAL_TIME),
            i18n.t(ROWS.CURRENCY),
            i18n.t(ROWS.OBJECTS),
        ];
        return bidConFields;
    }
}
