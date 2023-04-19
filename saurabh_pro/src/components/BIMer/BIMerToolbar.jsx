import "./bimer-toolbar.less";

import { AuthenticationStore, IfcStore } from "../../stores";
import { Button, Dropdown, Slider, Tag, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { faArrows, faCropAlt, faCube, faExpand, faLink, faMale, faSearch, faSync } from "@fortawesome/pro-light-svg-icons";

import { ReactComponent as ExplodeIcon } from "../../assets/images/explode-icon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TOOLS } from "./toolbar.utils";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router";

const BIMerToolbar = ({ viewerRef, selectedNode, toggleShowFileExportModal, onDownloadFile, ...props }) => {
    const [currentTool, setCurrentTool] = useState(TOOLS.FREE_ORBIT);
    const inCalculateView = props.match.path === "/projects/:projectId/calculate/:fileId";
    const filterRef = useRef();
    const role = AuthenticationStore.getRole();
    const [clipValue, setClipValue] = useState(0);
    const [explodeValue, setExplodeValue] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        const unsubscribeIfcStore = IfcStore.listen(ifcStoreUpdated);
        return () => unsubscribeIfcStore();
    }, []);

    useEffect(() => {
        if (viewerRef.current) {
            switch (currentTool) {
                case TOOLS.FREE_ORBIT:
                    viewerRef.current.freeOrbit();
                    IfcStore.setLinkState(false);
                    break;
                case TOOLS.PAN:
                    viewerRef.current.pan();
                    IfcStore.setLinkState(false);
                    break;
                case TOOLS.ZOOM:
                    viewerRef.current.zoom();
                    IfcStore.setLinkState(false);
                    break;
                case TOOLS.FIRST_PERSON:
                    viewerRef.current.firstPerson();
                    IfcStore.setLinkState(false);
                    break;
                case TOOLS.LINK:
                    IfcStore.setLinkState(true);
                    break;
            }
        }
    }, [viewerRef, currentTool]);

    useEffect(() => {
        viewerRef.current && viewerRef.current.clip(clipValue);
    }, [viewerRef, clipValue]);

    useEffect(() => {
        viewerRef.current && viewerRef.current.explode(explodeValue);
    }, [viewerRef, explodeValue]);

    const ifcStoreUpdated = (message) => {
        switch (message) {
            case "changeActiveTool":
                changeTool(IfcStore.getActiveTool());
                break;
            case "resetView":
                reset();
                break;
            default:
                break;
        }
    };

    const reset = () => {
        setExplodeValue(0);
        setClipValue(0);
        filterRef.current && filterRef.current.reset();
        viewerRef.current && viewerRef.current.reset();
    };

    const openInCalculate = () => {
        const projectId = parseInt(props.match.params.projectId, 10);
        props.history.push(`/projects/${projectId}/calculate/${selectedNode.key}`);
    };

    const changeTool = (value) => {
        setCurrentTool(value);
        IfcStore.setActiveTool(value);
    };

    return (
        <div className="Bimer_Container">
            {inCalculateView && (
                <>
                    <Tooltip placement="bottom" title={<span>{t("BIMER.CONNECT_OBJECT")}</span>}>
                        <Button
                            className={currentTool === TOOLS.LINK ? "Toolbar_Button--active" : ""}
                            icon={<FontAwesomeIcon icon={faLink} />}
                            onClick={() => {
                                changeTool(TOOLS.LINK);
                            }}
                            disabled={!role}
                        />
                    </Tooltip>
                    <Divider />
                </>
            )}
            <Tooltip
                placement="bottom"
                title={
                    <span>
                        {t("BIMER.ORBIT")}
                        <br />
                        <br />
                        <Tag>ALT + 1</Tag>
                    </span>
                }
            >
                <Button
                    className={currentTool === TOOLS.FREE_ORBIT ? "Toolbar_Button--active" : ""}
                    icon={<FontAwesomeIcon icon={faCube} />}
                    onClick={() => {
                        changeTool(TOOLS.FREE_ORBIT);
                    }}
                />
            </Tooltip>
            <Tooltip
                placement="bottom"
                title={
                    <span>
                        {t("BIMER.MOVE")}
                        <br />
                        <br />
                        <Tag>ALT + 2</Tag>
                    </span>
                }
            >
                <Button
                    className={currentTool === TOOLS.PAN ? "Toolbar_Button--active" : ""}
                    icon={<FontAwesomeIcon icon={faArrows} />}
                    onClick={() => {
                        changeTool(TOOLS.PAN);
                    }}
                />
            </Tooltip>
            <Tooltip
                placement="bottom"
                title={
                    <span>
                        {t("BIMER.ZOOM")}
                        <br />
                        <br />
                        <Tag>ALT + 3</Tag>
                    </span>
                }
            >
                <Button
                    className={currentTool === TOOLS.ZOOM ? "Toolbar_Button--active" : ""}
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onClick={() => {
                        changeTool(TOOLS.ZOOM);
                    }}
                />
            </Tooltip>
            <Tooltip
                placement="bottom"
                title={
                    <span>
                        {t("BIMER.FIRST_PERSON")}
                        <br />
                        <br />
                        <Tag>ALT + 4</Tag>
                    </span>
                }
            >
                <Button
                    className={currentTool === TOOLS.FIRST_PERSON ? "Toolbar_Button--active" : ""}
                    icon={<FontAwesomeIcon icon={faMale} />}
                    onClick={() => {
                        changeTool(TOOLS.FIRST_PERSON);
                    }}
                />
            </Tooltip>
            <Divider />

            <Tooltip placement="bottom" title={<span>{t("BIMER.EXPLODE")}</span>}>
                <Dropdown
                    overlay={
                        <div className={"Toolbar_Overlay"}>
                            <Slider value={explodeValue} onChange={setExplodeValue} />
                        </div>
                    }
                    trigger="click"
                >
                    <Button icon={<ExplodeIcon />} />
                </Dropdown>
            </Tooltip>
            <Tooltip placement="bottom" title={<span>{t("BIMER.CLIP")}</span>}>
                <Dropdown
                    overlay={
                        <div className={"Toolbar_Overlay"}>
                            <Slider
                                value={clipValue}
                                onChange={(value) => {
                                    setClipValue(value);
                                }}
                            />
                        </div>
                    }
                    trigger="click"
                >
                    <Button icon={<FontAwesomeIcon icon={faCropAlt} />} />
                </Dropdown>
            </Tooltip>
            {/* <Dropdown
                overlay={
                    <FilterOverlay
                        filters={
                            viewerRef.current
                                ? viewerRef.current.getAvailableFilterTypes().map((type) => ({
                                      text: type,
                                      value: type,
                                  }))
                                : []
                        }
                        filterMultiple={true}
                        triggerFilter={(keys) => {
                            if (viewerRef.current) {
                                if (keys.length === 0) {
                                    viewerRef.current.getAvailableFilterTypes().forEach((type) => {
                                        viewerRef.current.applyFilter(type, true);
                                    });
                                } else {
                                    viewerRef.current.getAvailableFilterTypes().forEach((type) => {
                                        keys.includes(type) ? viewerRef.current.applyFilter(type, true) : viewerRef.current.applyFilter(type, false);
                                    });
                                }
                            }
                        }}
                        ref={filterRef}
                    />
                }
                trigger="click"
            >
                <Button icon={<FontAwesomeIcon icon={faFilter} />} />
            </Dropdown> */}
            <Divider />
            <Tooltip
                placement="bottom"
                title={
                    <span>
                        {t("BIMER.RESET")}
                        <br />
                        <br />
                        <Tag>ALT + 0</Tag>
                    </span>
                }
            >
                <Button icon={<FontAwesomeIcon icon={faSync} />} onClick={reset} />
            </Tooltip>

            <Tooltip placement="bottom" title={<span>{t("BIMER.FULL_SCREEN")}</span>}>
                <Button
                    icon={<FontAwesomeIcon icon={faExpand} />}
                    onClick={() => {
                        viewerRef.current && viewerRef.current.toggleFullscreen();
                    }}
                />
            </Tooltip>
            {inCalculateView ? (
                <>
                    <Divider />
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.EXPORT")}
                                <br />
                                <br />
                                <Tag>CTRL + E</Tag>
                            </span>
                        }
                    >
                        <Button onClick={() => toggleShowFileExportModal(true)} icon={<FontAwesomeIcon icon={["fal", "file-export"]} />} />
                    </Tooltip>
                </>
            ) : (
                <>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.OPEN_IN_ESTIMATE")}
                                <br />
                                <br />
                                <Tag>Ctrl + O</Tag>
                            </span>
                        }
                    >
                        <Button onClick={openInCalculate} icon={<FontAwesomeIcon icon={["fal", "external-link"]} />} />
                    </Tooltip>
                    <Divider />

                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.DOWNLOAD")}
                                <br />
                                <br />
                                <Tag>Ctrl + D</Tag>
                            </span>
                        }
                    >
                        <Button onClick={onDownloadFile} icon={<FontAwesomeIcon icon={["fal", "cloud-download"]} />} />
                    </Tooltip>
                </>
            )}
        </div>
    );
};

const Divider = () => {
    return <span className="Bimer_Divider" />;
};

export default withRouter(BIMerToolbar);
