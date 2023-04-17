import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BLUE_5 = "#0AB1E1";
const RED_5 = "#E61C27";
const YELLOW_5 = "#F5B200";
const ORANGE_5 = "#F5B200";
const GREEN_10 = "#008000";

const FileIconSwitcher = ({ type, status }) => {
    switch (type) {
        case "folder":
            return <FontAwesomeIcon icon={["fal", "folder"]} style={{ color: YELLOW_5 }} />;
        case "pdf":
        case "file-pdf":
            return <FontAwesomeIcon icon={["fal", "file-pdf"]} style={{ color: RED_5 }} />;
        case "word":
        case "file-word":
        case "file-docx":
        case "docx":
            return <FontAwesomeIcon icon={["fal", "file-word"]} style={{ color: BLUE_5 }} />;
        case "excel":
        case "file-excel":
        case "file-xlsx":
        case "xlsx":
        case "xls":
            return <FontAwesomeIcon icon={["fal", "file-excel"]} style={{ color: GREEN_10 }} />;
        case "powerpoint":
        case "pptx":
        case "ppt":
        case "file-ppt":
            return <FontAwesomeIcon icon={["fal", "file-powerpoint"]} style={{ color: ORANGE_5 }} />;
        case "jpeg":
        case "jpg":
        case "file-jpg":
        case "file-image":
        case "png":
        case "svg":
            return <FontAwesomeIcon icon={["fal", "file-image"]} />;
        case "txt":
            return <FontAwesomeIcon icon={["fal", "file-alt"]} />;
        case "zip":
            return <FontAwesomeIcon icon={["fal", "file-archive"]} />;
        case "file-ifc":
        case "ifc":
            switch (status) {
                case "converted":
                    return <FontAwesomeIcon icon={["fal", "cube"]} style={{ color: BLUE_5 }} />;
                case "conversion_failed":
                    return <FontAwesomeIcon icon={["fal", "exclamation-triangle"]} style={{ color: RED_5 }} />;
            }
        case "loader":
            return <FontAwesomeIcon icon={["fal", "spinner"]} className="Spinner" />;
        default:
            return <FontAwesomeIcon icon={["fal", "file"]} />;
    }
};

export default FileIconSwitcher;
