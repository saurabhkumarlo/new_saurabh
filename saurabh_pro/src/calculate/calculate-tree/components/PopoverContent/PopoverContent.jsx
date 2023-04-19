import React from "react";
import { Button } from "antd";
import { faExclamationCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./popover-content.less";
import { Status } from "../../../../components";
import { TreeStoreV2 } from "stores";

const PopoverContent = (props) => {
    return props.annotation ? <TreePopOverContent {...props} /> : <FilterPopOverContent {...props} />;
};

const FilterPopOverContent = ({ annotation, checkedFilters, toggleCurrentFilters }) => {
    const activeNotStartedFilter = checkedFilters.includes("notStarted");
    const activeProgressFilter = checkedFilters.includes("progress");
    const activeReviewFilter = checkedFilters.includes("review");
    const activeCompleteFilter = checkedFilters.includes("complete");

    const canFilter = (currentStatus, isActive) => {
        if (!isActive) return true;
        return currentStatus;
    };

    return (
        <div className="Content">
            <div className="Title_Wrapper">
                <FontAwesomeIcon icon={["fal", "filter"]} />
                <label className="Title">Filter</label>
            </div>
            <div className="Icons_Container">
                <div className={activeNotStartedFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                    <Button
                        onClick={() => canFilter("notStarted", activeNotStartedFilter) && toggleCurrentFilters("notStarted")}
                        icon={
                            <div className="Status_Icon">
                                <Status notStarted />
                            </div>
                        }
                    />
                    {activeNotStartedFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                </div>
                <div className="Line" />
                <div className={activeProgressFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                    <Button
                        onClick={() => canFilter("progress", activeProgressFilter) && toggleCurrentFilters("progress")}
                        icon={
                            <div className="Status_Icon">
                                <Status progress />
                            </div>
                        }
                    />
                    {activeProgressFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                </div>
                <div className="Line" />
                <div className={activeReviewFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                    <Button
                        onClick={() => canFilter("review", activeReviewFilter) && toggleCurrentFilters("review")}
                        icon={
                            <div className="Status_Icon">
                                <Status review />
                            </div>
                        }
                    />
                    {activeReviewFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                </div>
                <div className="Line" />
                <div className={activeCompleteFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                    <Button
                        onClick={() => canFilter("complete", activeCompleteFilter) && toggleCurrentFilters("complete")}
                        icon={
                            <div className="Status_Icon">
                                <Status complete />
                            </div>
                        }
                    />
                    {activeCompleteFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                </div>
            </div>
        </div>
    );
};

const TreePopOverContent = ({ annotation, checkedFilters, toggleCurrentFilters }) => {
    const { type } = annotation.data;
    const status = type === "3DModel" ? annotation.data.xfdf.status : annotation.data.status;
    const activeNotStartedFilter = checkedFilters.includes("notStarted");
    const activeProgressFilter = checkedFilters.includes("progress");
    const activeReviewFilter = checkedFilters.includes("review");
    const activeCompleteFilter = checkedFilters.includes("complete");

    const canFilter = (currentStatus, isActive) => {
        if (!isActive) return true;
        if (type === "group") {
            if (annotation.statuses[currentStatus] === 0) return true;
            const activeFilters = checkedFilters.filter((item) => annotation.statuses[item] > 0);
            return activeFilters.length > 1;
        }
        return status !== currentStatus;
    };
    return (
        annotation && (
            <div className="Content">
                <div className="Title_Wrapper">
                    {TreeStoreV2.getFileIcon(type)}
                    <label className="Title">{annotation.title}</label>
                    {annotation.hasNegativeRow && (
                        <FontAwesomeIcon className="Exclamation_Circle_Icon" icon={type === "group" ? ["fal", "exclamation-circle"] : faExclamationCircle} />
                    )}
                </div>
                <div className="Icons_Container">
                    <div className={activeNotStartedFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                        <Button
                            onClick={() => canFilter("notStarted", activeNotStartedFilter) && toggleCurrentFilters("notStarted")}
                            icon={
                                <div className="Status_Icon">
                                    <Status notStarted />
                                </div>
                            }
                        />
                        <label>{type === "group" ? annotation.statuses.notStarted : status === "notStarted" ? 1 : 0}</label>
                        {activeNotStartedFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                    </div>
                    <div className="Line" />
                    <div className={activeProgressFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                        <Button
                            onClick={() => canFilter("progress", activeProgressFilter) && toggleCurrentFilters("progress")}
                            icon={
                                <div className="Status_Icon">
                                    <Status progress />
                                </div>
                            }
                        />
                        <label>{type === "group" ? annotation.statuses.progress : status === "progress" ? 1 : 0}</label>
                        {activeProgressFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                    </div>
                    <div className="Line" />
                    <div className={activeReviewFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                        <Button
                            onClick={() => canFilter("review", activeReviewFilter) && toggleCurrentFilters("review")}
                            icon={
                                <div className="Status_Icon">
                                    <Status review />
                                </div>
                            }
                        />
                        <label>{type === "group" ? annotation.statuses.review : status === "review" ? 1 : 0}</label>
                        {activeReviewFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                    </div>
                    <div className="Line" />
                    <div className={activeCompleteFilter ? "Icons_Wrapper" : "Icons_Wrapper Inactive"}>
                        <Button
                            onClick={() => canFilter("complete", activeCompleteFilter) && toggleCurrentFilters("complete")}
                            icon={
                                <div className="Status_Icon">
                                    <Status complete />
                                </div>
                            }
                        />
                        <label>{type === "group" ? annotation.statuses.complete : status === "complete" ? 1 : 0}</label>
                        {activeCompleteFilter && <FontAwesomeIcon className="Green_Icon" icon={["fal", "check"]} />}
                    </div>
                </div>
            </div>
        )
    );
};

export default PopoverContent;
