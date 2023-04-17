import "./projects.less";

import { AUTH_ACTION_NAME, GROUP_NAME, PROJECT_ACTION_NAME } from "constants/NodeActionsConstants";
import { Button, Col, Form, Input, Modal, Row, Select, Spin, Table, Tag, Tooltip } from "antd";
import { FileStore, NodeSocketStore } from "stores";

import AuthenticationStore from "../stores/AuthenticationStore";
import CountrySelector from "../utils/CountrySelector";
import DepartmentStore from "./../stores/DepartmentStore";
import FileActions from "../actions/FileActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Header } from "../components";
import HeaderStore from "./../stores/HeaderStore";
import ProjectsActions from "../actions/ProjectsActions";
import ProjectsStore from "./../stores/ProjectsStore";
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import currencies from "utils/currencies.json";
import ensureLogin from "../util/EnsureLogin";
import { handleProjectsKeyDown } from "utils/hotkeys/ProjectsHotkeys";
import moment from "moment";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";

class Projects extends React.PureComponent {
    formRef = React.createRef();
    role = AuthenticationStore.getRole();
    state = {
        departmentList: DepartmentStore.getAccessibleDeparments(),
        country: "Sweden",
        selectedDepartment: DepartmentStore.getSelectedDepartmentId(),
        selectedCurrency: "SEK",
        selectedSystem: "metric",
        newProjectDialog: false,
        selectedRowKeys: [],
        projectRows: [],
        projectLoader: {
            isLoading: ProjectsStore.projectLoaderData.isLoading,
            loadedCount: 0,
            wantedCount: 0,
        },

        projectDialogNumber: ProjectsStore.getNextProjectNumber(),
    };

    setInitialCountry = () => {
        let data = null;
        switch (localStorage.getItem("language")) {
            case "en":
                data = {
                    country: "Sweden",
                    selectedCurrency: "EUR",
                };
                break;
            case "da":
                data = {
                    country: "Denmark",
                    selectedCurrency: "DKK",
                };
                break;
            case "no":
                data = {
                    country: "Norway",
                    selectedCurrency: "NOK",
                };
                break;
            case "sv":
                data = {
                    country: "Sweden",
                    selectedCurrency: "SEK",
                };
                break;
            case "nl":
                data = {
                    country: "Netherlands",
                    selectedCurrency: "EUR",
                };
                break;
            default:
                break;
        }

        if (data === null) return;

        this.setState(data);
    };

    async componentDidMount() {
        this.unsubscribeProjectsStore = ProjectsStore.listen(this.projectsStoreUpdated);
        this.unsubscribeHeaderStore = HeaderStore.listen(this.headerStoreUpdated);
        this.unsubcribeDepartmentStore = DepartmentStore.listen(this.departmentStoreUpdated);
        document.addEventListener("keydown", handleProjectsKeyDown);
        FileStore.clearFileStore();
        this.setInitialCountry();
        if (ProjectsStore.getProjectRows().length === 0) {
            const token = AuthenticationStore.getJwt();
            await ProjectsStore.fetchProjects(token);
        }
        this.setState({ projectRows: ProjectsStore.getProjectRows() });
        ProjectsStore.setActiveProjectId(null);
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_PROJECT, { action: PROJECT_ACTION_NAME.LEAVE });
        if (AuthenticationStore.disconnectAnotherLogins) {
            NodeSocketStore.onSendMessage(GROUP_NAME.AUTH, { action: AUTH_ACTION_NAME.LICENSE_ACTIVATED_FROM_ELSEWHERE });
        }
    }

    componentWillUnmount() {
        this.unsubscribeProjectsStore();
        this.unsubscribeHeaderStore();
        this.unsubcribeDepartmentStore();
        document.removeEventListener("keydown", handleProjectsKeyDown);
    }

    getDepartemntUsers = () => {
        const currentDepartment = this.state.departmentList.toJS().find((depart) => depart.department.id === this.state.selectedDepartment);
        return (currentDepartment && currentDepartment.departmentUsers) || [];
    };

    generateFilters = (column) => {
        return this.state.projectRows.reduce((acc, item) => {
            let index = acc.findIndex((accItem) => accItem.text === item[column] && accItem.value === item[column]);

            if (index <= -1) {
                acc.push({
                    text: item[column],
                    value: item[column],
                });
            }

            return acc;
        }, []);
    };

    generateLeaderFilters = () => {
        const projectLeaders = this.getDepartemntUsers().map((item) => {
            const projectLead = `${item.firstName} ${item.lastName}`;
            return {
                text: projectLead,
                value: projectLead,
            };
        });
        return projectLeaders;
    };

    /**
     * Calculates the default sort values for the table columns.
     * If the key passed to myIndex isn't the one in localstorage,
     * it returns null.
     * @param {string} myIndex - The key to validate against
     * @param {Object} lsData - The data parsed from localstorage
     * @returns {?Object}
     */
    getDefaultSort = (myIndex, lsData) => {
        if (lsData.field !== myIndex) return null;

        return lsData.order;
    };

    get projectTableColumns() {
        let filters = {};
        let sorters = {};
        const { t } = this.props;

        if (localStorage.getItem("projectTable::sorter") !== null) {
            sorters = JSON.parse(localStorage.getItem("projectTable::sorter"));
        }

        if (localStorage.getItem("projectTable::filter") !== null) {
            filters = JSON.parse(localStorage.getItem("projectTable::filter"));
        }

        return [
            {
                title: t("GENERAL.ID"),
                dataIndex: "id",
                key: "id",
                sorter: (a, b) => parseInt(a.id, 10) - parseInt(b.id, 10),
                width: 100,
                defaultSortOrder: this.getDefaultSort("id", sorters),
            },
            {
                title: t("PROJECTS.PROJECT_NUMBER"),
                dataIndex: "projectNumber",
                key: "projectNumber",
                sorter: (a, b) => `${a.projectNumber}`.localeCompare(`${b.projectNumber}`),
                defaultSortOrder: this.getDefaultSort("projectNumber", sorters),
            },
            {
                title: t("PROJECTS.PROJECT_NAME"),
                dataIndex: "name",
                key: "name",
                sorter: (a, b) => a.name.localeCompare(b.name),
            },
            {
                title: t("PROJECTS.PROJECT_LEADER"),
                dataIndex: "projectLeader",
                key: "projectLeader",
                sorter: (a, b) => `${a.projectLeader}`.localeCompare(`${b.projectLeader}`),
                filters: this.generateLeaderFilters(),
                filterIcon: () => <FontAwesomeIcon className="Projects_Table_Icon--projectLead" icon={["fal", "filter"]} id="projects-filter_lead" />,
                onFilter: (value, record) => `${record.projectLeader}`.indexOf(value) === 0,
                defaultFilteredValue: filters.projectLeader,
                defaultSortOrder: this.getDefaultSort("projectLeader", sorters),
            },
            {
                title: t("GENERAL.DEPARTMENT"),
                dataIndex: "department",
                key: "department",
                sorter: (a, b) => a.department.localeCompare(b.department),
                filters: this.generateFilters("department"),
                filterIcon: () => <FontAwesomeIcon className="Projects_Table_Icon--department" icon={["fal", "filter"]} id="projects-filter_department" />,
                onFilter: (value, record) => record.department.indexOf(value) === 0,
                defaultFilteredValue: filters.department,
                defaultSortOrder: this.getDefaultSort("department", sorters),
            },
            {
                title: t("GENERAL.CREATED"),
                dataIndex: "createdAt",
                key: "createdAt",
                sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                defaultSortOrder: this.getDefaultSort("createdAt", sorters),
                render: (date) => (date ? moment(date).format("YYYY-MM-DD HH:mm") : ""),
            },
        ];
    }

    get projectTableColumnsForDelete() {
        const { t } = this.props;

        return [
            {
                title: t("GENERAL.ID"),
                dataIndex: "id",
                key: "id",
                width: 100,
                align: "center",
            },
            {
                title: t("PROJECTS.PROJECT_NUMBER"),
                dataIndex: "projectNumber",
                key: "projectNumber",
            },
            {
                title: t("PROJECTS.PROJECT_NAME"),
                dataIndex: "name",
                key: "name",
            },
            {
                title: t("PROJECTS.PROJECT_LEADER"),
                dataIndex: "projectLeader",
                key: "projectLeader",
            },
            {
                title: t("GENERAL.DEPARTMENT"),
                dataIndex: "department",
                key: "department",
            },
            {
                title: t("GENERAL.CREATED"),
                dataIndex: "createdAt",
                key: "createdAt",
            },
        ];
    }

    projectsStoreUpdated = (message, projectId) => {
        switch (message) {
            case "goToDrive":
                this.openProjectWithId(projectId);
                break;
            case "projectAdded":
            case "projectUpdated":
                this.setState({
                    projectRows: ProjectsStore.getProjectRows(),
                    projectLoader: {
                        ...this.state.projectLoader,
                        wantedCount: ProjectsStore.projectLoaderData.wanted,
                        loadedCount: ProjectsStore.projectLoaderData.loaded,
                        isLoading: ProjectsStore.projectLoaderData.isLoading,
                    },
                    projectDialogNumber: ProjectsStore.getNextProjectNumber(),
                });
                break;
            case "createNewProject":
                this.setState({
                    newProjectDialog: true,
                });
            case "openProjects":
                if (this.state.selectedRowKeys.length === 1) this.openProject();
                else if (this.state.selectedRowKeys.length > 1) this.openProjectInNewTab();
                break;
            case "deleteProjects":
                if (this.state.selectedRowKeys.length > 0) this.setState({ deleteProjectDialog: true });
                break;
            default:
                break;
        }
    };

    headerStoreUpdated = (message) => {
        if (message === "appSearchUpdated") {
            this.setState({ projectRows: ProjectsStore.getProjectRows() });
        }
    };

    departmentStoreUpdated = (message) => {
        switch (message) {
            case "departmentUserAccessRecieved":
                this.setState({ departmentList: DepartmentStore.getAccessibleDeparments() });
                if (!this.state.selectedDepartment) {
                    this.setState({
                        selectedDepartment: DepartmentStore.getSelectedDepartmentId(),
                    });
                }
                break;
            case "departmentSelectionUpdated":
                this.setState({
                    selectedDepartment: DepartmentStore.getSelectedDepartmentId(),
                });
                break;
            default:
                break;
        }
    };

    openProject = () => {
        FileActions.clearFileList();
        const selectedProject = this.state.projectRows.find((item) => this.state.selectedRowKeys.indexOf(item.key) > -1);
        this.props.history.push(`/projects/${selectedProject.id}/drive`);
    };

    openProjectWithId = (id) => {
        FileActions.clearFileList();
        this.props.history.push(`/projects/${id}/drive`);
    };

    openProjectInNewTab = () => {
        const selectedProjects = this.state.projectRows.filter((item) => this.state.selectedRowKeys.indexOf(item.key) > -1);

        selectedProjects.forEach((project) => {
            window.open(`/projects/${project.id}/drive`);
        });
    };

    /** New Project Dialog
     *  On creating a new project, open the new project after creation
     * */

    openNewProjectDialog = () => {
        this.setState({
            newProjectDialog: true,
        });
    };

    createNewProject = (values) => {
        this.setState({
            newProjectDialog: false,
        });
        ProjectsActions.requestInsertNewProject(
            values.projectDesignation,
            values.projectNumber,
            this.state.country,
            this.state.selectedDepartment,
            this.state.selectedCurrency,
            this.state.selectedSystem
        );
        //this.props.history.push('/projects/drive')
    };

    cancelNewProjectDialog = () => {
        this.setState({
            newProjectDialog: false,
        });
    };

    /** Delete Project Dialog
     *  When deleting one or more selected projects
     */

    openDeleteProjectDialog = () => {
        this.setState({
            deleteProjectDialog: true,
        });
    };

    deleteProject = () => {
        ProjectsActions.requestDeleteProject(this.filterSelectedRowKeys.map((proj) => proj.id));
        this.setState({
            deleteProjectDialog: false,
            selectedRowKeys: [],
        });
    };

    cancelDeleteProjectDialog = () => {
        this.setState({
            deleteProjectDialog: false,
        });
    };

    /** Project Table
     *
     */
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    setCountry = (country) => {
        this.setState({
            country: country,
        });
    };

    setDepartment = (value) => {
        this.setState({
            department: value,
        });
    };

    onChangeCreateProject = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    selectDepartment = (id) => {
        DepartmentStore.setSelectedDepartmentId(id);
    };

    selectCurrency = (cur) => {
        this.setState({
            selectedCurrency: cur,
        });
    };

    selectSystem = (system) => {
        this.setState({
            selectedSystem: system,
        });
    };

    onTableChange = (pagination, filter, sorter) => {
        localStorage.setItem("projectTable::pageSize", JSON.stringify(pagination.pageSize));
        localStorage.setItem("projectTable::filter", JSON.stringify(filter));
        localStorage.setItem("projectTable::sorter", JSON.stringify(sorter));
    };

    get filterSelectedRowKeys() {
        return this.state.projectRows.filter((row) => this.state.selectedRowKeys.includes(row.id));
    }

    render() {
        const { t } = this.props;
        const { selectedRowKeys } = this.state;
        return (
            <div className="Projects">
                <Header departList={this.state.departmentList} selectedDepartId={this.state.selectedDepartment} />

                <div className="Projects_Layout">
                    <div className="Projects_Layout_Sidebar">
                        <Sidebar />
                    </div>

                    <div className="Toolbar">
                        <Tooltip
                            title={
                                <span>
                                    {t("PROJECTS.TOOLTIP.CREATE_NEW_PROJECT")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + Alt + N</Tag>
                                </span>
                            }
                            placement="bottom"
                        >
                            <Button icon={<FontAwesomeIcon icon={["fal", "plus-circle"]} />} onClick={this.openNewProjectDialog} disabled={!this.role} />
                        </Tooltip>
                        <Tooltip
                            title={
                                <span>
                                    {t("PROJECTS.TOOLTIP.OPEN_PROJECT")}
                                    <br />
                                    <br />
                                    <Tag>Ctrl + O</Tag>
                                </span>
                            }
                            placement="bottom"
                        >
                            <Button
                                icon={<FontAwesomeIcon icon={["fal", "external-link-square-alt"]} />}
                                onClick={this.openProject}
                                disabled={this.state.selectedRowKeys.length !== 1}
                            />
                        </Tooltip>
                        <Tooltip title={<span>{t("PROJECTS.TOOLTIP.OPEN_PROJECT_NEW_TAB")}</span>} placement="bottom">
                            <Button
                                icon={<FontAwesomeIcon icon={["fal", "external-link-alt"]} />}
                                onClick={this.openProjectInNewTab}
                                disabled={this.state.selectedRowKeys.length === 0}
                            />
                        </Tooltip>
                        <Tooltip
                            title={
                                <span>
                                    {t("PROJECTS.TOOLTIP.DELETE_PROJECT")}
                                    <br />
                                    <br />
                                    <Tag>Delete</Tag>
                                </span>
                            }
                            placement="bottom"
                        >
                            <Button
                                icon={<FontAwesomeIcon icon={["fal", "trash"]} />}
                                onClick={this.openDeleteProjectDialog}
                                disabled={!this.role || this.state.selectedRowKeys.length === 0}
                            />
                        </Tooltip>
                    </div>
                    {this.state.projectLoader.isLoading ? (
                        <div className="Projects_ProgressWrapper">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table
                            showSorterTooltip={{ title: t("GENERAL.TOOLTIP.CHANGE_SORT_ORDER") }}
                            className="Projects_Table"
                            columns={this.projectTableColumns}
                            dataSource={this.state.projectRows}
                            pagination={{
                                position: ["topRight"],
                                defaultPageSize: JSON.parse(localStorage.getItem("projectTable::pageSize")) || 50,
                                locale: { items_per_page: t("GENERAL.PER_PAGE") },
                            }}
                            rowSelection={{
                                type: "checkbox",
                                selectedRowKeys,
                                onChange: this.onSelectChange,
                                hideSelectAll: true,
                            }}
                            size="middle"
                            tableLayout="fixed"
                            onRow={(record) => ({
                                onDoubleClick: () => {
                                    this.openProjectWithId(record.id);
                                },
                            })}
                            onChange={this.onTableChange}
                        />
                    )}
                </div>

                {/*TODO MOVE TO SEPARATE COMPONENTS - create Project, delete project*/}
                {this.state.newProjectDialog && (
                    <Modal
                        className="Projects_Modal"
                        title={t("PROJECTS.CREATE_NEW_PROJECT")}
                        visible={this.state.newProjectDialog}
                        /* onOk={this.createNewProject} */
                        closable={false}
                        cancelText={t("GENERAL.CANCEL")}
                        okText={t("GENERAL.CREATE")}
                        onCancel={this.cancelNewProjectDialog}
                        okButtonProps={{ form: "create-project", key: "submit", htmlType: "submit" }}
                        destroyOnClose
                    >
                        <Form
                            id="create-project"
                            layout={"vertical"}
                            onFinish={this.createNewProject}
                            onFinishFailed={(e) => console.log("Error info", e)}
                            ref={this.formRef}
                            autoComplete="off"
                        >
                            <Form.Item
                                initialValue={ProjectsStore.getNextProjectNumber()}
                                name="projectNumber"
                                label={t("PROJECTS.PROJECT_NUMBER")}
                                rules={[{ required: true, message: t("GENERAL.REQUIRED") }]}
                                getValueProps={() => { }}
                            >
                                <Input
                                    className="Input"
                                    placeholder={t("PROJECTS.PROJECT_NUMBER")}
                                    value={this.state.projectDialogNumber}
                                    suffix={
                                        <Tooltip title={t("PROJECTS.TOOLTIP.GET_LAST_PROJECT_NUMBER")} placement="bottom">
                                            <Button
                                                icon={<FontAwesomeIcon icon={["fal", "sync"]} />}
                                                onClick={() => {
                                                    const next = ProjectsStore.getNextProjectNumber();
                                                    this.setState({
                                                        projectDialogNumber: next,
                                                    });
                                                    this.formRef.current.setFieldsValue({
                                                        projectNumber: next,
                                                    });
                                                }}
                                            />
                                        </Tooltip>
                                    }
                                    onChange={(e) => {
                                        this.setState({
                                            projectDialogNumber: e.target.value,
                                        });
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="projectDesignation"
                                label={t("PROJECTS.PROJECT_NAME")}
                                rules={[{ required: true, message: t("GENERAL.REQUIRED") }]}
                            >
                                <Input className="Input" placeholder={t("PROJECTS.PROJECT_NAME")} />
                            </Form.Item>
                            <Form.Item name="country" label={t("GENERAL.COUNTRY")}>
                                <CountrySelector disabled={!this.role} country={this.state.country} setCountry={this.setCountry} />
                            </Form.Item>
                            <Form.Item label={t("GENERAL.DEPARTMENT_OPTIONAL")}>
                                <Select
                                    defaultValue={this.state.selectedDepartment}
                                    onChange={this.selectDepartment}
                                    suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                                >
                                    {this.state.departmentList.map((item) => (
                                        <Select.Option value={item.department.id} key={item.department.id}>
                                            {item.department.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t("GENERAL.CURRENCY")}>
                                            <Select
                                                defaultValue={this.state.selectedCurrency}
                                                onChange={this.selectCurrency}
                                                suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                                            >
                                                {currencies &&
                                                    currencies.map((currency) => (
                                                        <Select.Option value={currency.cc} key={currency.cc}>
                                                            {currency.cc} - {currency.name}, {currency.symbol},
                                                        </Select.Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Form>
                    </Modal>
                )}

                {this.state.deleteProjectDialog && (
                    <Modal
                        title={t("PROJECTS.DELETE_PROJECTS")}
                        visible={this.state.deleteProjectDialog}
                        onOk={this.deleteProject}
                        okText={t("GENERAL.DELETE")}
                        cancelText={t("GENERAL.CANCEL")}
                        onCancel={this.cancelDeleteProjectDialog}
                        width={"100%"}
                    >
                        <Table
                            style={{ overflow: "auto" }}
                            columns={this.projectTableColumnsForDelete}
                            dataSource={this.filterSelectedRowKeys}
                            pagination={false}
                            size="middle"
                            tableLayout="fixed"
                        />
                    </Modal>
                )}
            </div>
        );
    }
}

export default withTranslation()(ensureLogin(withRouter(Projects)));
