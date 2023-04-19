import "./calculateToolbar.less";

import { AnnotationStore, AuthenticationStore } from "../../../../stores";
import { Button, Divider, Input, Tag, Tooltip } from "antd";

import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { get } from "lodash";
import { AnnotationActions } from "actions";

const CalculateToolbar = ({ toogleActiveToolNode, activePage, setActivePage, pageCount, toolNode, toggleShowFileExportModal }) => {
    const role = AuthenticationStore.getRole();
    const { t } = useTranslation();
    const isEstimateLocked = get(AnnotationStore.ActiveEstimate?.toJS(), "locked");

    const selectPage = (e, isBlured = false) => {
        const value =
            get(e, "target.value") === "" && isBlured ? 1 : Number.parseInt(e.target.value, 10) > pageCount ? pageCount : Number.parseInt(e.target.value, 10);

        setActivePage(value);
        if (Number.isInteger(value) && value >= 1 && value <= pageCount) {
            AnnotationActions.setActivePageId(value, true);
        } else {
            AnnotationActions.setActivePageId(1, true);
        }
    };

    const pageBack = () => {
        if (typeof activePage === "number" && activePage > 1) {
            setActivePage(activePage - 1);
            AnnotationActions.setActivePageId(activePage - 1, true);
        }
    };

    const pageForward = () => {
        if (typeof pageCount === "number" && activePage < pageCount) {
            setActivePage(activePage + 1);
            AnnotationActions.setActivePageId(activePage + 1, true);
        }
    };

    return (
        <>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <div className="calculateToolbar">
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.SELECT")}
                                <br />
                                <br />
                                <Tag>Ctrl + 1</Tag>
                            </span>
                        }
                    >
                        <Button
                            onClick={() => toogleActiveToolNode("AnnotationEdit")}
                            className={toolNode === "AnnotationEdit" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "mouse-pointer"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.PAN")}
                                <br />
                                <br />
                                <Tag>{t("KEY.SPACE")}</Tag>
                            </span>
                        }
                    >
                        <Button
                            onClick={() => toogleActiveToolNode("Pan")}
                            className={toolNode === "Pan" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "arrows"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.POINT")}
                                <br />
                                <br />
                                <Tag>Ctrl + 2</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreatePoint")}
                            className={toolNode === "AnnotationCreatePoint" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "location"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.LINE")}
                                <br />
                                <br />
                                <Tag>Ctrl +3</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreatePolyline")}
                            className={toolNode === "AnnotationCreatePolyline" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "arrows-alt-h"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.AREA")}
                                <br />
                                <br />
                                <Tag>Ctrl + 4</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreatePolygon")}
                            className={toolNode === "AnnotationCreatePolygon" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "draw-polygon"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.ELLIPSE")}
                                <br />
                                <br />
                                <Tag>Ctrl + 5</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreateEllipse")}
                            className={toolNode === "AnnotationCreateEllipse" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "circle"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.DRAW")}
                                <br />
                                <br />
                                <Tag>Ctrl + 6</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreateFreeHand")}
                            className={toolNode === "AnnotationCreateFreeHand" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "tilde"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.REDUCTION")}
                                <br />
                                <br />
                                <Tag>Ctrl + Shift + 4</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || AnnotationStore.isReductionToolDisabled() || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreateReduction")}
                            className={toolNode === "AnnotationCreateReduction" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "object-group"]} />}
                        />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.COMMENT")}
                                <br />
                                <br />
                                <Tag>Ctrl + 7</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreateFreeText")}
                            className={toolNode === "AnnotationCreateFreeText" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "comment-alt-dots"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.IMAGE")}
                                <br />
                                <br />
                                <Tag>Ctrl + 8</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreateStamp")}
                            className={toolNode === "AnnotationCreateStamp" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "image"]} />}
                        />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.ARROW")}
                                <br />
                                <br />
                                <Tag>Ctrl + 9</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!role || isEstimateLocked}
                            onClick={() => toogleActiveToolNode("AnnotationCreateArrow")}
                            className={toolNode === "AnnotationCreateArrow" ? "Toolbar_Button--active" : null}
                            icon={<FontAwesomeIcon icon={["fal", "long-arrow-alt-right"]} />}
                        />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.ZOOM_SELECTION")}
                                <br />
                                <br />
                                <Tag>Alt + Z</Tag>
                            </span>
                        }
                    >
                        <Button onClick={() => toogleActiveToolNode("MarqueeZoomTool")} icon={<FontAwesomeIcon icon={["fal", "search"]} />} />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.FIT_TO_SCREEN")}
                                <br />
                                <br />
                                <Tag>Alt + 0</Tag>
                            </span>
                        }
                    >
                        <Button onClick={() => AnnotationStore.setFitToScreen()} icon={<FontAwesomeIcon icon={["fal", "expand"]} />} />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.PREVIOUS_PAGE")}
                                <br />
                                <br />
                                <Tag>Page Up</Tag>
                            </span>
                        }
                    >
                        <Button icon={<FontAwesomeIcon icon={["fal", "angle-left"]} />} onClick={pageBack} disabled={activePage === 1} />
                    </Tooltip>
                    <Input
                        id="pageInput"
                        value={activePage || ""}
                        addonAfter={pageCount ? "/ " + pageCount : ""}
                        onFocus={() => document.activeElement.select()}
                        className="PageInputGroup"
                        onChange={selectPage}
                        onBlur={(e) => selectPage(e, true)}
                    />
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.NEXT_PAGE")}
                                <br />
                                <br />
                                <Tag>Page Down</Tag>
                            </span>
                        }
                    >
                        <Button icon={<FontAwesomeIcon icon={["fal", "angle-right"]} />} onClick={pageForward} disabled={activePage === pageCount} />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.SAVE_TO_PDF")}
                                <br />
                                <br />
                                <Tag>Ctrl + P</Tag>
                            </span>
                        }
                    >
                        <Button onClick={() => AnnotationStore.printDocumentToPdf(false)} icon={<FontAwesomeIcon icon={["fal", "print"]} />} />
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.SAVE_SECTION_TO_PDF")}
                                <br />
                                <br />
                                <Tag>Ctrl + Shift + P</Tag>
                            </span>
                        }
                    >
                        <Button onClick={() => AnnotationStore.printDocumentToPdf(true)} icon={<FontAwesomeIcon icon={["fal", "print-search"]} />} />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("ESTIMATE.TOOLTIP.EXPORT")}
                                <br />
                                <br />
                                <Tag>Ctrl + E</Tag>
                            </span>
                        }
                    >
                        <Button onClick={() => toggleShowFileExportModal(true)} icon={<FontAwesomeIcon icon={["fal", "file-export"]} />} />
                    </Tooltip>
                </div>
            </ErrorBoundary>
        </>
    );
};

export default CalculateToolbar;
