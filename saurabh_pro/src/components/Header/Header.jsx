import "./header.less";

import { AnnotationStore, AuthenticationStore, EstimateStore, FileStore, HeaderStore, NodeSocketStore, ProjectsStore } from "../../stores";
import { Button, Dropdown, Input, Menu, Tag, Tooltip } from "antd";
import { CalculateHeader, ChangelogDialog, DriveHeader, FeedbackDialog } from "./components";
import { ErrorFallback, FolderDialog } from "..";
import React, { createRef } from "react";
import { find, get, isEmpty } from "lodash";

import { ErrorBoundary } from "react-error-boundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Immutable from "immutable";
import { getActiveFileFolderPath as getActiveFileFolderPathMethod } from "../../utils";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";

const { SubMenu } = Menu;

class Header extends React.PureComponent {
    constructor(props) {
        super(props);
        this.searchRef = createRef();
        this.userMenuRef = createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    state = {
        isQuickSwitchDialogOpened: false,
        feedbackDialog: false,
        changelogDialog: false,
        appSearch: "",
        activeFileId: null,
        fileList: new Immutable.List(),
        activeFileFolderPath: [],
        activeProject: null,
        companyName: null,
        geoEstimateName: null,
        treeData: null,
        isCommentsEnable: localStorage.getItem("showSupportWidget") === "false" ? false : true,
        userClicked: false,
    };

    componentDidMount() {
        this.unsubscribeHeaderStore = HeaderStore.listen(this.headerStoreUpdated);
        this.unsubscribeAnnotaiotnStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeEstimateStore = EstimateStore.listen(this.estimateStoreUpdated);
        this.unsubscribeFileStore = FileStore.listen(this.fileStoreUpdated);
        this.unsubscribeProjectsStore = ProjectsStore.listen(this.projectsStoreUpdated);
        this.loadDataForIFCFile();
        this.loadDataForOverviewPage();
        document.addEventListener("click", this.handleClickOutside, true);
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.isLoading !== this.props.isLoading ||
            prevProps.selectedNode !== this.props.selectedNode ||
            prevProps.activeProject !== this.props.activeProject
        ) {
            this.loadData();
        }
    }

    componentWillUnmount() {
        HeaderStore.setAppSearch("");
        this.unsubscribeHeaderStore();
        this.unsubscribeAnnotaiotnStore();
        this.unsubscribeEstimateStore();
        this.unsubscribeFileStore();
        this.unsubscribeProjectsStore();
        document.removeEventListener("click", this.handleClickOutside, true);
    }

    loadData() {
        const activeProject = ProjectsStore.getProjectById(parseInt(this.props.match.params.projectId, 10));
        const project = activeProject?.toJS();
        const companyName = project?.department?.company?.name;
        const activeEstimate = AnnotationStore.getActiveEstimate();
        const treeData = FileStore.getTreeData();
        this.setState(
            {
                fileList: FileStore.getAllSortedFilesList(),
                activeFileId: AnnotationStore.getActiveFileId(),
                activeProject,
                companyName,
                geoEstimateName: activeEstimate !== -1 && activeEstimate.get("name"),
                treeData,
            },
            () => this.renderTitle()
        );
    }

    annotationStoreUpdated = (message) => {
        if (message === "documentLoaded") {
            this.loadData();
            this.getActiveFileFolderPath();
        }
        if (message === "EstimateInitialized") {
            this.loadData();
        }
    };

    headerStoreUpdated = (message) => {
        if (message === "appSearchUpdated") {
            this.setState({ appSearch: HeaderStore.getAppSearch() });
        }
        if (message === "focusSearchInput") {
            this.searchRef.current.focus();
        }
        if (message === "showFeedbackDialog") {
            this.onChangeFeedbackDialog();
        }
    };

    estimateStoreUpdated = (message) => {
        if (message === "updateEstimates") {
            this.loadData();
        }
    };

    fileStoreUpdated = (message) => {
        if (message === "treeDataUpdated") {
            this.getActiveFileFolderPath();
            this.loadDataForIFCFile();
        }
    };

    projectsStoreUpdated = (message) => {
        if (message === "projectAdded" && !!this.state.activeProject && ProjectsStore.getProjectById(parseInt(this.props.match.params.projectId, 10)))
            this.loadData();
    };

    logOut = () => {
        ProjectsStore.clearProjects();
        AuthenticationStore.onLogout();
        this.props.history.push("/");
    };

    handleChange = (e) => {
        HeaderStore.setAppSearch(e.target.value);
    };

    switchCommentsStatus() {
        const currentValue = this.state.isCommentsEnable;
        localStorage.setItem("showSupportWidget", !currentValue);
        this.setState({ isCommentsEnable: !currentValue });
        if (!currentValue === false) window.Tawk_API.hideWidget();
        else window.Tawk_API.showWidget();
    }

    getActiveFileFolderPath = () => {
        const activeFileId = AnnotationStore.getActiveFileId() === -1 ? this.getActiveParentIdFromURL() : AnnotationStore.getActiveFileId();
        if (!activeFileId) return;
        const activeFileFolderPath = getActiveFileFolderPathMethod(activeFileId);

        this.setState({ activeFileFolderPath });
    };

    getActiveParentIdFromURL = () => {
        if (this.props.match.path.includes("calulate")) return parseInt(this.props.match.params.fileId, 10);
        else {
            const driveFileIdString = this.props.location.hash;
            const paresedFileId = driveFileIdString.slice(1);
            return parseInt(paresedFileId);
        }
    };

    renderDriveFolderPath = () => {
        let driveFolderPath = this.state.activeFileFolderPath.join(" > ");
        if (driveFolderPath.length > 100) {
            driveFolderPath = " ... > " + this.state.activeFileFolderPath[this.state.activeFileFolderPath.length - 1];
        }

        return driveFolderPath;
    };

    getActiveFile = () => {
        const activeFileId = this.state.activeFileId === -1 ? parseInt(this.props.match.params.fileId, 10) : this.state.activeFileId;
        return this.state.fileList
            ? get(
                  find(this.state.fileList, (file) => file.key === activeFileId),
                  "filename"
              )
            : null;
    };

    renderTitle = () => {
        const inCalculateView = this.props.match.path === "/projects/:projectId/calculate/:fileId";
        const inDriveView = this.props.match.path === "/projects/:projectId/drive";
        const inProjectView = this.props.match.path === "/projects";
        const inOverviewView = this.props.match.path === "/projects/:projectId/overview";
        const activeProjectName = this.state.activeProject && this.state.activeProject.get("name");
        const activeProjectNumber = this.state.activeProject && this.state.activeProject.get("projectNumber");
        const activeProjectString = `(${activeProjectNumber}) ${activeProjectName}`;
        const activeDepartment =
            inProjectView || inOverviewView ? this.props.departList.toJS().find((depart) => depart.department.id === this.props.selectedDepartId) : undefined;
        const companyName = activeDepartment?.department.company.name;
        const isAllCalculateDataLoaded =
            this.state.activeProject &&
            this.state.activeFileFolderPath.length !== 0 &&
            this.state.activeFileId &&
            this.state.fileList &&
            this.state.companyName;
        const isAllDriveDataLoaded = this.state.companyName;
        const isAllProjectDataLoaded = companyName && activeDepartment;
        const isAllOverviewDataLoaded = companyName && this.state.activeProject;
        if (inCalculateView && isAllCalculateDataLoaded) {
            return (
                <CalculateHeader
                    projectDetails={[this.state.companyName, activeProjectString, this.state.geoEstimateName]}
                    onChangeQuickSwitch={this.onChangeQuickSwitchDialog}
                    activeFile={this.getActiveFile()}
                    fileId={this.state.activeFileId}
                    activeFilePath={this.state.activeFileFolderPath}
                />
            );
        }
        if (inDriveView && isAllDriveDataLoaded && !isEmpty(this.props.selectedNode)) {
            return (
                <DriveHeader
                    projectDetails={[this.state.companyName, activeProjectString, this.state.geoEstimateName]}
                    onChangeQuickSwitch={this.onChangeQuickSwitchDialog}
                    selectedNode={this.props.selectedNode}
                    treeData={this.state.treeData}
                    onNodeBack={this.props.onNodeBack}
                />
            );
        }
        if (inProjectView && isAllProjectDataLoaded) return <div>{companyName}</div>;
        if (inOverviewView && isAllOverviewDataLoaded) return <div className="activeProjectString">{`${companyName} > ${activeProjectString}`}</div>;
        return "";
    };

    onChangeFolderDialog = () => {
        this.setState({ isQuickSwitchDialogOpened: false });
    };

    onChangeFeedbackDialog = () => {
        this.setState({ feedbackDialog: !this.state.feedbackDialog });
    };

    onChangelogDialog = () => {
        this.setState({ changelogDialog: !this.state.changelogDialog });
    };

    onChangeQuickSwitchDialog = () => {
        this.setState({ isQuickSwitchDialogOpened: !this.state.isQuickSwitchDialogOpened });
    };

    onDoubleClickDriveHandler = (data) => {
        this.onChangeFolderDialog();
        this.props.onDoubleClickDrive(data);
    };

    loadDataForIFCFile = () => {
        const fileId = parseInt(this.props.match.params.fileId, 10);
        const file = FileStore.getFileById(fileId);
        const fileType = get(file, "type");
        const inCalculateView = this.props.match.path === "/projects/:projectId/calculate/:fileId";
        const rootFolder = FileStore.getRootFolder();
        if (inCalculateView && rootFolder && fileType === "ifc") {
            this.getActiveFileFolderPath();
            this.loadData();
        }
    };

    loadDataForOverviewPage = () => {
        if (this.props.match.path === "/projects/:projectId/overview" && ProjectsStore.getActiveProject()) this.loadData();
    };
    handleClickOutside(event) {
        if (this.userMenuRef.current && !this.userMenuRef.current.contains(event.target)) {
            this.setState({ userClicked: false });
        }
    }

    changeLanguage = (e) => {
        const { i18n } = this.props;
        i18n.changeLanguage(e.key);
        localStorage.setItem("language", e.key);
        window._setupTawk();
    };

    render() {
        const { t } = this.props;
        const { isCommentsEnable } = this.state;
        const userName = AuthenticationStore.getUser();

        const userMenu = (
            <Menu className="Calculate_Rows_ContextMenu">
                <SubMenu key="language" title={t("GENERAL.CHANGE_LANGUAGE")}>
                    <Menu.Item onClick={this.changeLanguage} key="en" value="en">
                        English
                    </Menu.Item>
                    <Menu.Item onClick={this.changeLanguage} key="sv" value="sv">
                        Svenska
                    </Menu.Item>
                    <Menu.Item onClick={this.changeLanguage} key="no" value="no">
                        Norsk
                    </Menu.Item>
                    {/*
TEMPORARY DISABLE UNTIL LOCALISATION IS COMPLETE
<Menu.Item onClick={this.changeLanguage} key="da" value="da">
                        Dansk
                    </Menu.Item>
                    <Menu.Item onClick={this.changeLanguage} key="nl" value="nl">
                        Nederlands
                    </Menu.Item>
                    <Menu.Item onClick={this.changeLanguage} key="es" value="es">
                        Español
                    </Menu.Item>
 */}{" "}
                    <Menu.Item onClick={this.changeLanguage} key="dev" value="dev">
                        Dev
                    </Menu.Item>
                </SubMenu>

                <Menu.Item key="2" onClick={() => this.props.history.push(`/forgot-password/${Buffer.from(userName).toString("base64")}/changePassword`)}>
                    <FontAwesomeIcon icon={["fal", "user-shield"]} />
                    {t("GENERAL.CHANGE_PASSWORD")}
                </Menu.Item>
                <Menu.Item key="1" onClick={this.logOut}>
                    <FontAwesomeIcon icon={["fal", "sign-out"]} />
                    {t("GENERAL.LOG_OUT")}
                </Menu.Item>
            </Menu>
        );

        return (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <div className="Header">
                    <FolderDialog
                        visible={this.state.isQuickSwitchDialogOpened}
                        onCancel={this.onChangeFolderDialog}
                        top
                        title={t("GENERAL.QUICKSWITCH")}
                        withFilter
                        type="estimate"
                        onDoubleClickDrive={this.onDoubleClickDriveHandler}
                        selectedKeys={this.props.selectedKeys}
                    />
                    {this.state.feedbackDialog && <FeedbackDialog visible={this.state.feedbackDialog} onCancel={this.onChangeFeedbackDialog} />}
                    {this.state.changelogDialog && <ChangelogDialog visible={this.state.changelogDialog} onCancel={this.onChangelogDialog} />}

                    <div className="Header_Wrapper--left">
                        <img src={process.env.PUBLIC_URL + "/logo.png"} className={"Header_Logo"} alt="Logo" />
                        <Tooltip
                            title={
                                <span>
                                    {t("GENERAL.TOOLTIP.SEARCH")}
                                    <br />
                                    <br />
                                    <Tag>Shift + Space</Tag>
                                </span>
                            }
                            placement="bottom"
                        >
                            <Input
                                ref={this.searchRef}
                                value={this.state.appSearch}
                                onChange={this.handleChange}
                                type="search"
                                placeholder={t("GENERAL.SEARCH_WITH_HOTKEY")}
                                prefix={<FontAwesomeIcon icon={["fal", "search"]} />}
                            />
                        </Tooltip>
                    </div>
                    <div className="Header_Title">{this.renderTitle()}</div>
                    <div className="Header_Buttons_Wrapper">
                        <Tooltip title={<span>{t("GENERAL.TOOLTIP.CHANGELOG")}</span>} placement="bottom">
                            <Button icon={<FontAwesomeIcon icon={["fal", "bullhorn"]} />} onClick={this.onChangelogDialog} />
                        </Tooltip>
                        <Tooltip title={<span>{t("GENERAL.TOOLTIP.CHAT_SUPPORT")}</span>} placement="bottom">
                            <Button
                                icon={<FontAwesomeIcon icon={["fal", "comments"]} />}
                                className={`${isCommentsEnable && "Toolbar_Button--active"}`}
                                onClick={() => this.switchCommentsStatus()}
                            />
                        </Tooltip>
                        <Tooltip
                            title={
                                <span>
                                    {t("GENERAL.TOOLTIP.FEEDBACK")}
                                    <br />
                                    <br />
                                    <Tag>CTRL + Alt + F</Tag>
                                </span>
                            }
                            placement="bottom"
                        >
                            <Button icon={<FontAwesomeIcon icon={["fal", "paper-plane"]} />} onClick={this.onChangeFeedbackDialog} />
                        </Tooltip>
                        <Dropdown overlay={userMenu} trigger={["click"]} className="Dropdown_Container">
                            <Button
                                ref={this.userMenuRef}
                                className={`${this.state.userClicked && "userMenuHighlighted"}`}
                                type="text"
                                onClick={() => this.setState({ userClicked: !this.state.userClicked })}
                                icon={<FontAwesomeIcon icon={["fal", "user"]} />}
                            />
                        </Dropdown>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }
}

export default withTranslation()(withRouter(Header));
