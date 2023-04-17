import "./sidebar.less";

import { Button, Tooltip } from "antd";

import { AnnotationStore, ObjectsStore } from "../stores";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";
import classNames from "classnames";

class Sidebar extends React.PureComponent {
    get activeRoute() {
        return this.props.location.pathname.split("/").pop();
    }

    get fileId() {
        return this.props.fileId || this.props.match.params.fileId;
    }

    render() {
        const { t } = this.props;

        return (
            <div className="Sidebar">
                <Tooltip title={<span>{t("GENERAL.TOOLTIP.PROJECTS")}</span>} placement="right">
                    <Button
                        icon={<FontAwesomeIcon className="Sidebar_Button_Icon" icon={["fal", "home"]} />}
                        type="link"
                        onClick={() => this.props.history.push("/projects")}
                        className={classNames(`Sidebar_Button ${this.activeRoute === "projects" && "Sidebar_Button--active"}`)}
                    />
                </Tooltip>

                <Tooltip title={<span>{t("GENERAL.TOOLTIP.OVERVIEW")}</span>} placement="right">
                    <Button
                        icon={
                            <FontAwesomeIcon
                                className={classNames(`Sidebar_Button_Icon ${this.activeRoute === "projects" ? "Sidebar_Button_Icon_disabled" : ""}`)}
                                icon={["fal", "info-circle"]}
                            />
                        }
                        type="link"
                        onClick={() => this.props.history.push(`/projects/${this.props.match.params.projectId}/overview`)}
                        className={`Sidebar_Button ${this.activeRoute === "overview" && "Sidebar_Button--active"}`}
                        disabled={this.activeRoute === "projects"}
                    />
                </Tooltip>

                <Tooltip title={<span>{t("GENERAL.TOOLTIP.DRIVE")}</span>} placement="right">
                    <Button
                        icon={
                            <FontAwesomeIcon
                                className={classNames(`Sidebar_Button_Icon ${this.activeRoute === "projects" ? "Sidebar_Button_Icon_disabled" : ""}`)}
                                icon={["fal", "folders"]}
                            />
                        }
                        type="link"
                        onClick={() => {
                            ObjectsStore.clearSelection();
                            this.props.history.push(`/projects/${this.props.match.params.projectId}/drive`);
                        }}
                        className={`Sidebar_Button ${this.activeRoute === "drive" && "Sidebar_Button--active"}`}
                        disabled={this.activeRoute === "projects"}
                    />
                </Tooltip>
                <Tooltip title={<span>{t("GENERAL.TOOLTIP.ESTIMATE")}</span>} placement="right">
                    <Button
                        icon={
                            <FontAwesomeIcon
                                className={classNames(
                                    `Sidebar_Button_Icon ${
                                        !this.fileId || this.activeRoute === "projects" || this.props.type === "folder" ? "Sidebar_Button_Icon_disabled" : ""
                                    }`
                                )}
                                icon={["fal", "calculator"]}
                            />
                        }
                        type="link"
                        onClick={() => this.props.history.push(`/projects/${this.props.match.params.projectId}/calculate/${this.fileId}`)}
                        className={classNames(
                            `Sidebar_Button ${this.props.match.path === "/projects/:projectId/calculate/:fileId" && "Sidebar_Button--active"}`
                        )}
                        disabled={!this.fileId || this.activeRoute === "projects" || this.props.type === "folder"}
                    />
                </Tooltip>
            </div>
        );
    }
}

export default withTranslation()(withRouter(Sidebar));
