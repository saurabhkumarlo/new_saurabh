import "./overview.less";

import { AnnotationStore, FileStore } from "stores";
import { Card, Col, Input, Modal, Row, Select } from "antd";
import { FileActions, ProjectActions } from "actions";

import AuthenticationStore from "../stores/AuthenticationStore";
import CountrySelector from "./../utils/CountrySelector";
import DepartmentStore from "./../stores/DepartmentStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Header } from "../components";
import ProjectsActions from "../actions/ProjectsActions";
import ProjectsStore from "./../stores/ProjectsStore";
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import currencies from "utils/currencies.json";
import ensureLogin from "../util/EnsureLogin";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";

class Overview extends React.PureComponent {
    role = AuthenticationStore.getRole();

    state = {
        departmentUsers: DepartmentStore.departmentUserList,
        departmentList: DepartmentStore.departmentUserAccess,
        selectedDepartment: DepartmentStore.getSelectedDepartmentId(),
        activeProject: null,
        hasSetDefaults: false,
        nameError: "",
    };

    componentDidMount() {
        this.unsubscribeProjectsStore = ProjectsStore.listen(this.projectsStoreUpdated);
        this.unsubcribeDepartmentStore = DepartmentStore.listen(this.departmentStoreUpdated);
        this.setState(
            {
                activeProject: ProjectsStore.getProjectById(parseInt(this.props.match.params.projectId), 10),
            },
            this.setDefaults
        );

        if (ProjectsStore.getProjectRows().length === 0) {
            const token = AuthenticationStore.getJwt();
            ProjectsStore.fetchProjects(token);
        }

        const projectId = parseInt(this.props.match.params.projectId, 10);
        if (FileStore.treeList.length === 0) {
            FileActions.requestGetFiles(projectId);
        }
        ProjectsActions.requestOpenProject(projectId);
        if (!AnnotationStore.isAnnotationActionDone()) {
            ProjectActions.requestProject(projectId);
        }

        ProjectsStore.setActiveProjectId(projectId);
    }

    componentWillUnmount() {
        this.unsubscribeProjectsStore();
        this.unsubcribeDepartmentStore();
    }

    departmentStoreUpdated = (message) => {
        if (message === "departmentUserAccessRecieved") {
            this.setState({ departmentList: DepartmentStore.departmentUserAccess, departmentUsers: DepartmentStore.departmentUserList });
            if (!this.state.selectedDepartment) {
                this.setState({
                    selectedDepartment: DepartmentStore.departmentUserAccess.first().department.id,
                });
            }
        }
    };

    setDefaults = () => {
        if (this.state.hasSetDefaults) return;
        if (!this.state.activeProject) return;
        this.setState({
            hasSetDefaults: true,
            projectNumber: this.state.activeProject.get("projectNumber"),
            projectName: this.state.activeProject.get("name"),
            address1: this.state.activeProject.get("address1"),
            address2: this.state.activeProject.get("address2"),
            postCode: this.state.activeProject.get("postCode"),
            city: this.state.activeProject.get("city"),
            country: this.state.activeProject.get("country"),
            department: this.state.activeProject.get("department").get("id"),
            projectLeaderId: this.state.activeProject.get("projectLeaderId"),
            units: this.state.activeProject.get("units"),
            currency: this.state.activeProject.get("currency"),
        });
    };

    projectsStoreUpdated = (message) => {
        switch (message) {
            case "projectAdded":
            case "projectUpdated":
                this.setState(
                    {
                        activeProject: ProjectsStore.getProjectById(parseInt(this.props.match.params.projectId), 10),
                    },
                    this.setDefaults
                );
                break;
            default:
                break;
        }
    };

    defaultGet = (object, prop) => {
        if (!!object && !!object.get) {
            return object.get(prop);
        }

        return null;
    };

    setProjectCountry = (e) => {
        this.setState({
            country: e,
        });
        ProjectsActions.requestUpdateProject({ id: this.props.match.params.projectId, country: e });
    };

    selectDepartment = (e) => {
        let userIds = [];
        this.setState(
            {
                department: e,
            },
            () => {
                userIds = this.departmentUsers.map((user) => {
                    return user.id;
                });
                if (!userIds.includes(this.state.projectLeaderId)) {
                    this.setState({
                        projectLeaderDialog: true,
                    });
                    return;
                }
                ProjectsActions.requestUpdateProject({ id: this.props.match.params.projectId, department: { id: e } });
            }
        );
    };

    selectUnits = (e) => {
        this.setState({
            units: e,
        });
        ProjectsActions.requestUpdateProject({ id: this.props.match.params.projectId, units: e });
    };

    selectCurrency = (e) => {
        this.setState({
            currency: e,
        });
        ProjectsActions.requestUpdateProject({ id: this.props.match.params.projectId, currency: e });
    };

    selectProjectLeader = (e) => {
        this.setState({
            projectLeaderId: e,
            projectLeaderDialog: false,
        });
        ProjectsActions.requestUpdateProject({ id: this.props.match.params.projectId, projectLeaderId: e });
    };

    get departmentUsers() {
        const department = this.state.departmentList.find((item) => item.department.id === this.state.department);
        if (!department) {
            return [];
        }
        return department.departmentUsers;
    }

    render() {
        const { t } = this.props;

        return (
            <div className="Overview">
                <Header activeProject={this.state.activeProject} departList={this.state.departmentList} selectedDepartId={this.state.selectedDepartment} />

                <div className="Overview_Layout">
                    <Sidebar />

                    <div className="Overview_Wrapper">
                        <Row gutter={[16, 16]}>
                            <Col xs={24}>
                                <Card className="Overview_Card">
                                    <Card.Meta className="Overview_Card_Title" title={t("Project Details")} />
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={8}>
                                            <label>
                                                {t("PROJECTS.PROJECT_NUMBER")}
                                                <Input
                                                    className="Input"
                                                    disabled={!this.role}
                                                    name="projectNumber"
                                                    value={this.state.projectNumber}
                                                    onChange={(e) => this.setState({ projectNumber: e.target.value })}
                                                    onBlur={() => {
                                                        ProjectsActions.requestUpdateProject({
                                                            id: this.props.match.params.projectId,
                                                            projectNumber: this.state.projectNumber,
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </Col>
                                        <Col xs={24} sm={16}>
                                            <label>
                                                {t("PROJECTS.PROJECT_NAME")}
                                                <Input
                                                    className="Input"
                                                    disabled={!this.role}
                                                    name="projectName"
                                                    value={this.state.projectName}
                                                    onChange={(e) => this.setState({ projectName: e.target.value, nameError: "" })}
                                                    onBlur={() => {
                                                        if (this.state.projectName.replace(/\s/g, "").length > 0) {
                                                            ProjectsActions.requestUpdateProject({
                                                                id: this.props.match.params.projectId,
                                                                name: this.state.projectName,
                                                            });
                                                        } else {
                                                            this.setState({ nameError: "Required field." });
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {this.state.nameError && (
                                                <div class="ant-form-item-explain ant-form-item-explain-error">
                                                    <div role="alert">{this.state.nameError}</div>
                                                </div>
                                            )}
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <label>
                                                {t("GENERAL.ADDRESS")}
                                                <Input
                                                    className="Input"
                                                    disabled={!this.role}
                                                    name="address1"
                                                    value={this.state.address1}
                                                    onChange={(e) => this.setState({ address1: e.target.value })}
                                                    onBlur={() => {
                                                        ProjectsActions.requestUpdateProject({
                                                            id: this.props.match.params.projectId,
                                                            address1: this.state.address1,
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <label>
                                                {t("GENERAL.C_O")}
                                                <Input
                                                    className="Input"
                                                    disabled={!this.role}
                                                    name="address2"
                                                    value={this.state.address2}
                                                    onChange={(e) => this.setState({ address2: e.target.value })}
                                                    onBlur={() => {
                                                        ProjectsActions.requestUpdateProject({
                                                            id: this.props.match.params.projectId,
                                                            address2: this.state.address2,
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <label>
                                                {t("GENERAL.POST_CODE")}
                                                <Input
                                                    className="Input"
                                                    disabled={!this.role}
                                                    name="postCode"
                                                    value={this.state.postCode}
                                                    onChange={(e) => this.setState({ postCode: e.target.value })}
                                                    onBlur={() => {
                                                        ProjectsActions.requestUpdateProject({
                                                            id: this.props.match.params.projectId,
                                                            postCode: this.state.postCode,
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <label>
                                                {t("GENERAL.CITY")}
                                                <Input
                                                    className="Input"
                                                    disabled={!this.role}
                                                    name="city"
                                                    value={this.state.city}
                                                    onChange={(e) => this.setState({ city: e.target.value })}
                                                    onBlur={() => {
                                                        ProjectsActions.requestUpdateProject({ id: this.props.match.params.projectId, city: this.state.city });
                                                    }}
                                                />
                                            </label>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <label>
                                                {t("GENERAL.COUNTRY")}
                                                <CountrySelector
                                                    disabled={!this.role}
                                                    country={this.state.country}
                                                    setCountry={(e) => this.setProjectCountry(e)}
                                                />
                                            </label>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            {this.state.projectLeaderDialog && (
                                <Modal
                                    visible={this.state.projectLeaderDialog}
                                    maskClosable={false}
                                    title={t("PROJECTS.CURRENT_PROJECT_LEADER_NOT_AVAILABLE")}
                                    footer={[]}
                                >
                                    <label>
                                        {t("PROJECTS.PROJECT_LEADER")}
                                        <Select
                                            suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                                            disabled={!this.role}
                                            value={t("PROJECTS.CHOOSE_ANOTHER_PROJECT_LEADER")}
                                            onSelect={(e) => this.selectProjectLeader(e)}
                                        >
                                            {this.departmentUsers.map((user) => {
                                                return (
                                                    <Select.Option value={user.id} key={user.id}>
                                                        {user.firstName} {user.lastName}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    </label>
                                </Modal>
                            )}

                            <Col xs={24} sm={12}>
                                <Card className="Overview_Card">
                                    <Card.Meta className="Overview_Card_Title" title={t("PROJECTS.MANAGEMENT")} />
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24}>
                                            <label>
                                                {t("GENERAL.DEPARTMENT")}
                                                <Select
                                                    suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                                                    disabled={!this.role}
                                                    value={this.state.department}
                                                    onSelect={(e) => this.selectDepartment(e)}
                                                >
                                                    {this.state.departmentList.map((item) => (
                                                        <Select.Option value={item.department.id} key={item.department.id}>
                                                            {item.department.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </label>
                                        </Col>
                                        <Col xs={24}>
                                            <label>
                                                {t("PROJECTS.PROJECT_LEADER")}
                                                <Select
                                                    suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                                                    disabled={!this.role}
                                                    value={this.state.projectLeaderId}
                                                    onSelect={(e) => this.selectProjectLeader(e)}
                                                >
                                                    {this.departmentUsers.map((user) => {
                                                        return (
                                                            <Select.Option value={user.id} key={user.id}>
                                                                {user.firstName} {user.lastName}
                                                            </Select.Option>
                                                        );
                                                    })}
                                                </Select>
                                            </label>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Card className="Overview_Card">
                                    <Card.Meta className="Overview_Card_Title" title={t("GENERAL.SETTINGS")} />
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24}>
                                            <label>
                                                {t("GENERAL.CURRENCY")}
                                                <Select
                                                    suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                                                    disabled={!this.role}
                                                    value={this.state.currency}
                                                    onSelect={(e) => this.selectCurrency(e)}
                                                >{currencies &&
                                                    currencies.map((currency) => (
                                                        <Select.Option value={currency.cc} key={currency.cc}>
                                                            {currency.cc} - {currency.name}, {currency.symbol},
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </label>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(ensureLogin(withRouter(Overview)));
