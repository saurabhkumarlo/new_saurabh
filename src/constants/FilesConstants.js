//##############################-NPM Packages-##################################
import Moment from "moment";
import "moment/locale/sv";
//##############################################################################
//# NOTE All constants and HelperFunctions that are connected with the
//#      FileStore.
//##############################################################################
export const FileVersions = ["A", "B", "C", "D", "C", "D", "E", "F", "G", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"];

export function AppendDataToFile(file) {
    return parseDataObject(file);
}
export function UpdateFileObject(file) {
    file = file.set("depth", parseDepth(file, 0));
    return file.map((value, key) => {
        if (key === "geoFile") {
            return value.get("id");
        } else {
            return value;
        }
    });
}
function parseDataObject(file) {
    file = file.set("depth", parseDepth(file, 0));
    return file
        .map((value, key) => {
            if (key === "added" || key === "lastTiled") {
                return parseDate(value);
            } else if (key === "size") {
                return parseSize(value);
            } else if (key === "geoFile") {
                return value.get("id");
            } else {
                return value;
            }
        })
        .set("icon", parseIcon(file.get("type")))
        .set("type", parseIcon(file.get("type")))
        .set("selected", false);
}
function parseDepth(file, depth) {
    if (file.has("geoFile")) {
        return depth + parseDepth(file.get("geoFile"), depth + 1);
    } else {
        return 0;
    }
}
function parseDate(number) {
    return Moment(new Date(number)).locale("sv").format("YYYY-MM-DD HH:mm");
}
function parseSize(byteSize) {
    let size = 0;
    if (byteSize > 0) {
        const i = Math.floor(Math.log(byteSize) / Math.log(1024));
        size = (byteSize / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][i];
    } else {
        size = "0 Bytes";
    }
    return size;
}
export const parseIcon = (type) => {
    switch (type) {
        case "pdf":
            return "pdf";
        case "doc":
        case "docx":
        case "vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "docx";
        case "xls":
        case "xlsx":
        case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return "xlsx";
        case "jpeg":
        case "jpg":
            return "jpeg";
        case "png":
            return "png";
        case "gif":
            return "gif";
        case "drawing":
            return "drawing";
        case "ifc":
            return "ifc";
        case "txt":
            return "txt";
        case "zip":
            return "zip";
        case "ppt":
            return "ppt";
        case "":
            return "none";
        default:
            return "object";
    }
};
