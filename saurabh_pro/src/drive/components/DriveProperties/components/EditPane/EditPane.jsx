import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getExtension, getFileName, getTreeData, getTreeWithPaths, getAbbreviatedPath } from "./EditPane.utils";
import { Input, TreeSelect } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

import "./editPane.less";

const EditPane = ({ role, selectedNode, treeData, name, onChangeName, onChangeFolder, onBlur }) => {
    const [toNodeObject, setToNodeObject] = useState(null);
    const [fromNodeObject, setFromNodeObject] = useState(null);
    const [selectedNodePath, setSelectedNodePath] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (toNodeObject && fromNodeObject) {
            onChangeFolder(fromNodeObject, toNodeObject);
            setFromNodeObject(null);
            setToNodeObject(null);
        }
    }, [toNodeObject, fromNodeObject]);

    useEffect(() => {
        if (selectedNode.key && treeData[0].children) {
            getObjectPath(getTreeWithPaths(treeData), selectedNode.key);
        }
    }, [selectedNode, treeData]);

    const getFolderPosition = (arr, id) => {
        const matchingNode = arr.find((node) => node.key === id);
        if (matchingNode) {
            id === selectedNode.key ? setFromNodeObject(matchingNode) : setToNodeObject(matchingNode);
            return;
        }
        for (const folder of arr) getFolderPosition(folder.children, id);
    };

    const getObjectPath = (arr, id) => {
        if (arr.length === 0) return;
        const PATH_SEPARATOR = " > ";
        const PATH_MAX_LENGTH = 2;
        const matchingNode = arr.find((node) => node.key === id);
        if (matchingNode) {
            const pathArr = matchingNode.path.split(PATH_SEPARATOR);
            pathArr.splice(-1, 1);
            return setSelectedNodePath(getAbbreviatedPath(pathArr, PATH_MAX_LENGTH, PATH_SEPARATOR));
        }
        for (const folder of arr) if (folder.children) getObjectPath(folder.children, id);
    };

    const onTryChangeFolder = (id) => {
        if (selectedNode.type === "folder") {
            getFolderPosition(getTreeData(treeData), id);
            getFolderPosition(getTreeData(treeData), selectedNode.key);
        } else {
            onChangeFolder(selectedNode, { key: id });
        }
    };

    return (
        <div className="EditPane">
            <label>
                {t("GENERAL.FOLDER")}
                <TreeSelect
                    treeData={getTreeData(treeData)}
                    treeDefaultExpandAll
                    value={selectedNodePath}
                    onChange={onTryChangeFolder}
                    suffixIcon={<FontAwesomeIcon icon={faCaretDown} />}
                    disabled={selectedNode.parentId === null || !role}
                />
            </label>
            <label>
                {t("GENERAL.NAME")}
                <Input
                    value={getFileName(name, selectedNode)}
                    onChange={onChangeName}
                    addonAfter={getExtension(selectedNode)}
                    onBlur={() => onBlur("name")}
                    onPressEnter={() => onBlur("name")}
                    disabled={selectedNode.parentId === null || !role}
                />
            </label>
        </div>
    );
};

export default EditPane;
