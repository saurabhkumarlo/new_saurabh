import { ANNOTS } from "../constants";
import i18n from "../i18nextInitialized";

export default class AnnotationExportFieldsFactory {
    constructor() {}

    getFolderFullExportFields(pathLength) {
        let dynamicFields = [i18n.t(ANNOTS.ID)];
        let i;
        for (i = 1; i <= pathLength; i++) {
            dynamicFields.push(i18n.t(ANNOTS.GROUP_FOLDER) + " " + i);
        }
        const standardFields = [
            i18n.t(ANNOTS.AREA),
            i18n.t(ANNOTS.LENGTH),
            i18n.t(ANNOTS.VOLUME),
            i18n.t(ANNOTS.WALL),
            i18n.t(ANNOTS.NET_AREA),
            i18n.t(ANNOTS.NET_LENGTH),
            i18n.t(ANNOTS.NET_VOLUME),
            i18n.t(ANNOTS.NET_WALL),
            i18n.t(ANNOTS.RED_AREA),
            i18n.t(ANNOTS.RED_LENGTH),
            i18n.t(ANNOTS.RED_VOLUME),
            i18n.t(ANNOTS.RED_WALL),
            i18n.t(ANNOTS.COUNT),
            i18n.t(ANNOTS.AVERAGE_AREA),
            i18n.t(ANNOTS.AVERAGE_LENGTH),
            i18n.t(ANNOTS.AVERAGE_VOLUME),
            i18n.t(ANNOTS.AVERAGE_WALL),
            i18n.t(ANNOTS.AREA_TILES),
            i18n.t(ANNOTS.AREA_JOINT_LENGTH),
            i18n.t(ANNOTS.AREA_JOINT_VOLUME),
            i18n.t(ANNOTS.WALL_TILES),
            i18n.t(ANNOTS.WALL_JOINT_LENGTH),
            i18n.t(ANNOTS.WALL_JOINT_VOLUME),
        ];
        return dynamicFields.concat(standardFields);
    }

    getAnnotationNetOnlyNoPathExportFields() {
        const fields = [
            i18n.t(ANNOTS.ID),
            i18n.t(ANNOTS.NUMBER),
            i18n.t(ANNOTS.NAME),
            i18n.t(ANNOTS.HEIGHT),
            i18n.t(ANNOTS.NET_AREA),
            i18n.t(ANNOTS.NET_LENGTH),
            i18n.t(ANNOTS.NET_VOLUME),
            i18n.t(ANNOTS.NET_WALL),
            i18n.t(ANNOTS.POINTS),
            i18n.t(ANNOTS.COUNT),
            i18n.t(ANNOTS.TYPE),
            i18n.t(ANNOTS.AREA_TILES),
            i18n.t(ANNOTS.AREA_JOINT_LENGTH),
            i18n.t(ANNOTS.AREA_JOINT_VOLUME),
            i18n.t(ANNOTS.WALL_TILES),
            i18n.t(ANNOTS.WALL_JOINT_LENGTH),
            i18n.t(ANNOTS.WALL_JOINT_VOLUME),
            i18n.t(ANNOTS.TEXT_CONTENTS),
            i18n.t(ANNOTS.FILE_NAME),
        ];
        return fields;
    }

    getAnnotationNetOnlyExportFields(pathLength) {
        let dynamicFields = [i18n.t(ANNOTS.ID)];
        let i;
        for (i = 1; i <= pathLength; i++) {
            dynamicFields.push(i18n.t(ANNOTS.GROUP_FOLDER) + " " + i);
        }
        const standardFields = [
            i18n.t(ANNOTS.NUMBER),
            i18n.t(ANNOTS.NAME),
            i18n.t(ANNOTS.HEIGHT),
            i18n.t(ANNOTS.NET_AREA),
            i18n.t(ANNOTS.NET_LENGTH),
            i18n.t(ANNOTS.NET_VOLUME),
            i18n.t(ANNOTS.NET_WALL),
            i18n.t(ANNOTS.POINTS),
            i18n.t(ANNOTS.COUNT),
            i18n.t(ANNOTS.TYPE),
            i18n.t(ANNOTS.AREA_TILES),
            i18n.t(ANNOTS.AREA_JOINT_LENGTH),
            i18n.t(ANNOTS.AREA_JOINT_VOLUME),
            i18n.t(ANNOTS.WALL_TILES),
            i18n.t(ANNOTS.WALL_JOINT_LENGTH),
            i18n.t(ANNOTS.WALL_JOINT_VOLUME),
            i18n.t(ANNOTS.TEXT_CONTENTS),
            i18n.t(ANNOTS.FILE_NAME),
        ];
        return dynamicFields.concat(standardFields);
    }

    getAnnotationFullExportFields(pathLength) {
        let dynamicFields = [i18n.t(ANNOTS.ID)];
        let i;
        for (i = 1; i <= pathLength; i++) {
            dynamicFields.push(i18n.t(ANNOTS.GROUP_FOLDER) + " " + i);
        }
        const standardFields = [
            i18n.t(ANNOTS.NUMBER),
            i18n.t(ANNOTS.NAME),
            i18n.t(ANNOTS.HEIGHT),
            i18n.t(ANNOTS.AREA),
            i18n.t(ANNOTS.LENGTH),
            i18n.t(ANNOTS.VOLUME),
            i18n.t(ANNOTS.WALL),
            i18n.t(ANNOTS.NET_AREA),
            i18n.t(ANNOTS.NET_LENGTH),
            i18n.t(ANNOTS.NET_VOLUME),
            i18n.t(ANNOTS.NET_WALL),
            i18n.t(ANNOTS.RED_AREA),
            i18n.t(ANNOTS.RED_LENGTH),
            i18n.t(ANNOTS.RED_VOLUME),
            i18n.t(ANNOTS.RED_WALL),
            i18n.t(ANNOTS.POINTS),
            i18n.t(ANNOTS.AREA_TILES),
            i18n.t(ANNOTS.AREA_JOINT_LENGTH),
            i18n.t(ANNOTS.AREA_JOINT_VOLUME),
            i18n.t(ANNOTS.WALL_TILES),
            i18n.t(ANNOTS.WALL_JOINT_LENGTH),
            i18n.t(ANNOTS.WALL_JOINT_VOLUME),
            i18n.t(ANNOTS.COUNT),
            i18n.t(ANNOTS.TYPE),
            i18n.t(ANNOTS.REDUCTION_OF),
            i18n.t(ANNOTS.OUTER_DIM_X),
            i18n.t(ANNOTS.OUTER_DIM_Y),
            i18n.t(ANNOTS.RADIUS_X),
            i18n.t(ANNOTS.RADIUS_X),
            i18n.t(ANNOTS.DIAMETER_X),
            i18n.t(ANNOTS.DIAMETER_Y),
            i18n.t(ANNOTS.TEXT_CONTENTS),
            i18n.t(ANNOTS.FILE_NAME),
        ];
        return dynamicFields.concat(standardFields);
    }
}
