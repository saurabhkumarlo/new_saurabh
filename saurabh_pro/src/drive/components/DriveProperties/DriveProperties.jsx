import React, { useState, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { Collapse } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorBoundary } from "react-error-boundary";

import AuthenticationStore from "../../../stores/AuthenticationStore";
import { getFullName } from "./components/EditPane/EditPane.utils";
import { DescriptionPane, EditPane, WorkflowPane, DetailsPane } from "./components";
import { ErrorFallback } from "../../../components";
import { DRIVE_PANEL_KEYS } from "./DriveProperties.utils";

import "./driveProperties.less";

const { Panel } = Collapse;

const DriveProperties = ({ selectedNode, treeData, onUpdateFileProps, onUpdateFileLocation, onChangeStatus }) => {
    const [nodeDetails, setNodeDetails] = useState({
        name: selectedNode.title,
        description: selectedNode.description,
        shortDescription: selectedNode.shortDescription,
        status: selectedNode.nodeStatus,
    });
    const [activePanelKeys, setActivePanelKeys] = useState(JSON.parse(localStorage.getItem("activeDrivePanelKeys")) || DRIVE_PANEL_KEYS);
    const [filenameError, setfilenameError] = useState("");
    const prevSelectedNode = useRef();
    const { t } = useTranslation();
    const role = AuthenticationStore.getRole();
    const sholudDisplayIfcError = selectedNode.status === "conversion_failed";

    useEffect(() => {
        prevSelectedNode.current = {
            name: selectedNode.title,
            description: selectedNode.description,
            shortDescription: selectedNode.shortDescription,
            status: selectedNode.nodeStatus,
        };
        setfilenameError("");
        setNodeDetails({
            name: selectedNode.title,
            description: selectedNode.description,
            shortDescription: selectedNode.shortDescription,
            status: selectedNode.nodeStatus,
        });
    }, [selectedNode]);

    const onBlur = (field) => {
        switch (field) {
            case "name":
                if (nodeDetails.name === prevSelectedNode.current.name) return;
                if (nodeDetails.name.replace(/\s/g, "").length > 0) {
                    onUpdateFileProps(selectedNode.key, field, getFullName(nodeDetails.name, selectedNode));
                    prevSelectedNode.current.name = nodeDetails.name;
                } else {
                    setfilenameError("Required");
                }
                break;
            case "shortDescription":
                if (nodeDetails.shortDescription !== prevSelectedNode.current.shortDescription) {
                    onUpdateFileProps(selectedNode.key, field, nodeDetails.shortDescription);
                    prevSelectedNode.current.shortDescription = nodeDetails.shortDescription;
                }
                break;
            case "description":
                if (nodeDetails.description !== prevSelectedNode.current.description) {
                    onUpdateFileProps(selectedNode.key, field, nodeDetails.description);
                    prevSelectedNode.current.description = nodeDetails.description;
                }
                break;
            default:
                return;
        }
    };
    const onChangeFolder = (fromNode, toNode) => {
        onUpdateFileLocation(fromNode, toNode);
    };

    const onChangeHandler = (value, prop) => {
        setfilenameError("");
        setNodeDetails((n) => ({ ...n, [prop]: value }));
    };

    const onChangeActivePanelKeys = (key) => {
        localStorage.setItem("activeDrivePanelKeys", JSON.stringify(key));
        setActivePanelKeys(key);
    };

    return sholudDisplayIfcError ? (
        <div class="IFC-error">
            <FontAwesomeIcon icon={["fal", "exclamation-circle"]} className={"error-icon"} />
            <label>{t("ERROR.IFC_CONVERSION_FAILED")}</label>
        </div>
    ) : (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="DriveProperties">
                <Collapse
                    defaultActiveKey={activePanelKeys}
                    onChange={onChangeActivePanelKeys}
                    expandIcon={({ isActive }) => (
                        <span>
                            <FontAwesomeIcon icon={["fal", "caret-down"]} className={`${!isActive && "fa-rotate-right-90"}`} />
                        </span>
                    )}
                >
                    <Panel header={t("GENERAL.EDIT")} key="edit">
                        <EditPane
                            role={role}
                            selectedNode={selectedNode}
                            treeData={treeData}
                            name={nodeDetails.name}
                            onChangeName={(e) => onChangeHandler(e.target.value, "name")}
                            onChangeFolder={onChangeFolder}
                            onBlur={onBlur}
                        />
                        {filenameError && (
                            <div class="ant-form-item-explain ant-form-item-explain-error">
                                <div role="alert">{filenameError}</div>
                            </div>
                        )}
                    </Panel>

                    {selectedNode.type !== "folder" && (
                        <Panel header={t("GENERAL.WORKFLOW")} key="workflow">
                            <WorkflowPane status={nodeDetails.status} onChangeStatus={onChangeStatus} />
                        </Panel>
                    )}
                    <Panel header={t("GENERAL.DESCRIPTION")} key="description" className="DescriptionPane">
                        <DescriptionPane
                            role={role}
                            description={nodeDetails.description}
                            shortDescription={nodeDetails.shortDescription}
                            onChangeDescription={(e) => onChangeHandler(e.target.value, "description")}
                            onChangeShortDescription={(e) => onChangeHandler(e.target.value, "shortDescription")}
                            onBlur={onBlur}
                        />
                    </Panel>
                    {selectedNode.type !== "folder" && (
                        <Panel header={t("GENERAL.DETAILS")} key="details">
                            <DetailsPane selectedNode={selectedNode} />
                        </Panel>
                    )}
                </Collapse>
            </div>
        </ErrorBoundary>
    );
};

export default DriveProperties;
