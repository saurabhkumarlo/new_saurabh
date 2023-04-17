import React, { useRef, useEffect, useState } from "react";

import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { getTreeWithPaths } from "../../../../drive/components/DriveProperties/components/EditPane/EditPane.utils";
import { PATH_SEPARATOR, AVERAGE_CHAR_WIDTH, OTHER_HEADER_COMPONENTS_WIDTH, SPACE_LIMIT, WINDOW_INNER_WIDTH } from "./DriveHeader.utils";

import "./driveHeader.less";

const DriveHeader = ({ onChangeQuickSwitch, projectDetails, treeData, selectedNode, onNodeBack }) => {
    const [drivePath, setDrivePath] = useState(null);
    const actualSelectedNode = useRef(selectedNode);
    const selectedNodePath = useRef();
    const projectPathDetails = useRef({ shortPath: null, actualComponentsWidth: null });

    useEffect(() => {
        window.addEventListener("resize", shouldPathStringChange);
        return () => window.removeEventListener("resize", shouldPathStringChange);
    }, []);
    useEffect(() => {
        actualSelectedNode.current = selectedNode;
        getProjectPath();
    }, [selectedNode, treeData, projectDetails]);

    const shouldPathStringChange = () => {
        getProjectPath();
    };
    const getSelectedNodePath = (arr, id) => {
        const matchingNode = arr.find((node) => node.key === id);
        if (matchingNode) {
            selectedNodePath.current = matchingNode.path;
            return;
        }
        for (const folder of arr) getSelectedNodePath(folder.children, id);
    };
    const getProjectPath = () => {
        getSelectedNodePath(getTreeWithPaths(treeData), actualSelectedNode.current.key);
        const path = [...projectDetails, selectedNodePath.current].join(PATH_SEPARATOR);
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
        setDrivePath(pathfinal);
    };

    return (
        <div className="Header_Path">
            <Button onClick={onNodeBack} disabled={selectedNode.parentId === null}>
                <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
            <span className="drivePath">{drivePath}</span>
            <Button onClick={onChangeQuickSwitch}>
                <FontAwesomeIcon icon={faCaretDown} />
            </Button>
        </div>
    );
};

export default DriveHeader;
