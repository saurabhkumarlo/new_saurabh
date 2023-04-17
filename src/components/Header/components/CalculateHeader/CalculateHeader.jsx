import React, { useRef, useEffect, useState } from "react";

import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

import { PATH_SEPARATOR, AVERAGE_CHAR_WIDTH, OTHER_HEADER_COMPONENTS_WIDTH, SPACE_LIMIT, WINDOW_INNER_WIDTH } from "./CalculateHeader.utils";

import "./calculateHeader.less";

const CalculateHeader = ({ onChangeQuickSwitch, projectDetails, activeFile, activeFilePath }) => {
    const [calculatePath, setCalculatePath] = useState("");
    const projectPathDetails = useRef({ shortPath: null, actualComponentsWidth: null });

    useEffect(() => {
        window.addEventListener("resize", shouldPathStringChange);
        return () => window.removeEventListener("resize", shouldPathStringChange);
    }, []);
    useEffect(() => {
        getPath();
    }, [projectDetails]);

    const shouldPathStringChange = () => {
        getPath();
    };

    const getPath = () => {
        const path = [...projectDetails, ...activeFilePath, activeFile].join(PATH_SEPARATOR);
        let firstString = [];
        let lastString = [];
        let strArr = path.split(PATH_SEPARATOR);
        let pathLimit = Number(window.innerWidth) < WINDOW_INNER_WIDTH ? 3 : 8;

        for (let index = 0; index < strArr.length; index++) {
            const strTxt = strArr[index];
            let charDisplayLimit = 20;
            let txt = "";

            if (index < pathLimit && index !== strArr.length - 1) {
                txt = strTxt.length > charDisplayLimit ? strTxt.slice(0, charDisplayLimit).concat("...") : strTxt;
                firstString.push(txt);
            }
            if (index === strArr.length - 1) {
                txt =
                    strTxt.length > charDisplayLimit
                        ? "..." + strTxt.substring(strTxt.length - charDisplayLimit, strTxt.length)
                        : strTxt.substring(strTxt.length - charDisplayLimit, strTxt.length);
                lastString.push(txt);
            }
        }
        const allMatch = firstString.concat(lastString);
        const pathfinal =
            strArr.length <= allMatch.length
                ? firstString.join(PATH_SEPARATOR) + " > " + lastString.join(PATH_SEPARATOR)
                : firstString.join(PATH_SEPARATOR) + " > ... > " + lastString.join(PATH_SEPARATOR);
        setCalculatePath(pathfinal);
    };

    return (
        <div className="Header_Path" data-cy="calculate_header">
            {calculatePath}
            <Button onClick={onChangeQuickSwitch}>
                <FontAwesomeIcon icon={faCaretDown} />
            </Button>
        </div>
    );
};

export default CalculateHeader;
