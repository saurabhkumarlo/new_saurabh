import i18n from "./../i18nextInitialized";
import { all, create } from "mathjs";
import ProjectsStore from "./../stores/ProjectsStore";
import DepartmentStore from "./../stores/DepartmentStore";
import Immutable from "immutable";
import json2csv from "json2csv";
import { ANNOTS } from "../constants";
import { EstimateStore } from "stores";

const config = {
    epsilon: 1e-12,
    matrix: "Matrix",
    number: "number",
    precision: 64,
    predictable: false,
    randomSeed: null,
};
const math = create(all, config);

export default class AbstractExportDispatcher {
    constructor() {}

    /**
     * Abstract method
     */
    dispatch(exportType) {
        throw new Error("Method not overriden yet!");
    }

    initFolderData(dataList) {
        return dataList.map((dataObject) => {
            if (dataObject.has(i18n.t("folder"))) {
                let pathList = Immutable.fromJS(dataObject.get(i18n.t("folder")).split(">"));
                if (pathList.size === 2 && pathList.get(0) === "" && pathList.get(1) === "") {
                    pathList = Immutable.fromJS([""]);
                }
                pathList.forEach((path, index) => {
                    dataObject = dataObject.set(i18n.t(ANNOTS.GROUP_FOLDER) + " " + (index + 1), path + " >");
                });
            }
            return dataObject;
        });
    }

    translateToLocale(value) {
        if (
            i18n.language.indexOf("sv") !== -1 ||
            i18n.language.indexOf("no") !== -1 ||
            i18n.language.indexOf("nn") !== -1 ||
            i18n.language.indexOf("nb") !== -1 ||
            i18n.language.indexOf("da") !== -1 ||
            i18n.language.indexOf("nl") !== -1
        ) {
            return math.round(value, 3).toString().replace(".", ",");
        } else {
            return math.round(value, 3);
        }
    }

    applyTranslation(data) {
        return data.map((obj) => {
            return obj
                .mapKeys((key) => {
                    let tmpVal = key;
                    switch (key) {
                        case "name":
                            tmpVal = ANNOTS.NAME;
                            break;
                        case "number":
                            tmpVal = ANNOTS.NUMBER;
                            break;
                        case "type":
                            tmpVal = ANNOTS.TYPE;
                            break;
                        default:
                    }
                    return i18n.t(tmpVal);
                })
                .toMap();
        });
    }

    getProjectExportHeadlineToClipboard(exportName) {
        let headline = "";
        let projectLeaderName = "";
        let dateString = "";
        const activeProject = ProjectsStore.getProjectById(ProjectsStore.getActiveProjectId());
        if (activeProject) {
            const projectLeader = DepartmentStore.getDepartmentUserById(activeProject.get("projectLeaderId"));
            if (projectLeader) {
                projectLeaderName = projectLeader.get("firstName") + " " + projectLeader.get("lastName");
            }
            const date = new Date();
            const formattedDate = new Intl.DateTimeFormat(i18n.language, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(date);
            dateString = formattedDate.toString();
            headline =
                "Geometra " +
                i18n.t("Export") +
                " - (" +
                activeProject.get("projectNumber") +
                ") " +
                activeProject.get("name") +
                " - " +
                EstimateStore.getActiveEstimate().name +
                " - " +
                i18n.t(exportName) +
                " - [" +
                projectLeaderName +
                " - " +
                dateString +
                "]";
        }

        let returnValue = new Immutable.Map();
        return returnValue
            .set(
                "exportData",
                json2csv({
                    fields: [
                        {
                            label: "",
                            value: headline,
                            default: "",
                            stringify: false,
                        },
                    ],
                    del: "\t",
                })
            )
            .set("filename", headline);
    }
}
