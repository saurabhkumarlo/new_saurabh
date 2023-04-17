import { uniqBy } from "lodash";
import AuthenticationStore from "./AuthenticationStore";
import DepartmentStore from "./DepartmentStore";
import GeometricCalculation from "./../utils/GeometricCalculation";
import HeaderStore from "./HeaderStore";
import Immutable from "immutable";
import Logger from "../utils/Logger.js";
import ProjectsActions from "../actions/ProjectsActions";
import { createStore } from "reflux";
import { FileStore, NodeSocketStore } from "stores";
import { GROUP_NAME, PROJECT_ACTION_NAME } from "constants/NodeActionsConstants";
import { FileActions } from "../actions";
import axios from "axios";
import moment from "moment";
import AnnotationStore from "./AnnotationStore";
import EstimateStore from "./EstimateStore";
import ObjectsStore from "./ObjectsStore";

export default createStore({
    listenables: [ProjectsActions],
    init() {
        Logger.d("ProjectsStore: init");
        this.projects = new Immutable.List();
        this.activeProjectId = undefined;
        this.departmentList = new Immutable.List();
        this.projectLoaderData = {
            wanted: 0,
            loaded: 0,
            isLoading: true,
        };
    },
    setActiveProjectId(id) {
        if (this.activeProjectId === id) return;
        this.activeProjectId = id;
        if (id) NodeSocketStore.onSetActiveProjectId(id);
    },
    onCreateNewProject() {
        this.trigger("createNewProject");
    },
    onOpenProjects() {
        this.trigger("openProjects");
    },
    onDeleteProjects() {
        this.trigger("deleteProjects");
    },
    getActiveProjectId() {
        return this.activeProjectId;
    },
    getActiveProject() {
        if (this.getActiveProjectId()) {
            return this.getProjectById(this.getActiveProjectId());
        }
        return undefined;
    },
    getProjects() {
        return this.projects.sort((a, b) => {
            if (a.get("id") > b.get("id")) {
                return -1;
            } else {
                return 1;
            }
        });
    },
    getProjectCurrency(projectID) {
        return this.getProjectById(projectID) ? this.getProjectById(projectID).get("currency") : "EUR";
    },
    getProjectUnitsByID() {
        const project = this.getProjectById(this.getActiveProjectId());
        if (project) {
            return project.get("units");
        }
        return undefined;
    },
    getProjectById(projectId) {
        Logger.d("getProjectById" + projectId);
        return this.projects.find((value) => {
            return value.get("id") === projectId << 0;
        });
    },
    getDepartmentList() {
        return this.departmentList;
    },
    getNextProjectNumber() {
        const calculator = new GeometricCalculation();

        let currentProjectNr = this.projects?.get(this.projects?.size - 1)?.get("projectNumber");
        if (currentProjectNr) {
            return calculator.getNextNumberString(currentProjectNr);
        } else {
            return calculator.getNextNumberString("000");
        }
    },

    getProjectRows() {
        const projectList = this.getProjects();
        return this.getReactDataGridRows(projectList);
    },

    getReactDataGridRows(addedProjects) {
        let tempRows = [];
        let searchText = HeaderStore.getAppSearch();
        addedProjects.forEach((project) => {
            try {
                const addProject = project.toJS();
                addProject.key = addProject.id;
                if (project.getIn(["department", "name"])) {
                    addProject.department = project.getIn(["department", "name"]);
                } else {
                    const department = this.departmentList.find((dep) => {
                        if (dep.department.id === project.getIn(["department", "id"])) {
                            return true;
                        }
                        return false;
                    });
                    if (department) {
                        addProject.department = department.department.name;
                    } else {
                        addProject.department = "";
                    }
                }
                addProject.projectLeader = project.get("projectLeaderName");
                addProject.createdAt = moment(addProject.createdAt).format("YYYY-MM-DD HH:mm");
                tempRows.push(addProject);
            } catch (error) {
                console.log("Error | getReactDataGridRows: " + error);
            }
        });
        if (searchText) {
            searchText = searchText.toLowerCase();
            tempRows = tempRows.filter((row) => {
                let val =
                    ("" + row.id).indexOf(searchText) !== -1 ||
                    row.projectNumber?.toLowerCase().indexOf(searchText) !== -1 ||
                    row.name?.toLowerCase().indexOf(searchText) !== -1;
                if (!val) {
                    val = typeof row.projectLeader === "string" ? row.projectLeader.toLowerCase().indexOf(searchText) !== -1 : false;
                }
                if (!val) {
                    val = typeof row.department === "string" ? row.department.toLowerCase().indexOf(searchText) !== -1 : false;
                }
                return val;
            });
        }
        const uniqueRows = uniqBy(tempRows, "id");
        return uniqueRows;
    },
    closeDialogAfterDeletion() {
        this.trigger("closeDialogAfterDeletion");
    },
    closeNewProjectDialog() {
        this.trigger("closeNewProjectDialog");
    },
    updateDepartmentList() {
        this.departmentList = DepartmentStore.getAccessibleDeparments();
    },

    onRequestProject(geoProjectId) {
        AnnotationStore.setFetchingDataLoader(true);
        axios
            .get(`${process.env.REACT_APP_NODE_URL}/estimates`, {
                headers: {
                    Authorization: AuthenticationStore.getJwt(),
                },
                params: {
                    projectId: geoProjectId,
                },
            })
            .then((res) => {
                this.onRequestEstimateHandler(res);
            })
            .catch((err) => {
                AnnotationStore.setFetchingDataLoader(false);
                console.log(err);
            });
    },

    onRequestEstimateHandler({ data }) {
        console.time("createHashMap");
        ObjectsStore.createHashMap(data);
        console.timeEnd("createHashMap");

        const paresedEstimates = data.map((estimateObject) => {
            const { annotations, estimate, rows, scales } = estimateObject;
            return {
                theGeoEstimate: estimate,
                theGeoAnnotationList: annotations,
                theGeoScaleList: scales,
                rows,
            };
        });
        FileActions.incrementLoader(25, paresedEstimates.length);
        EstimateStore.onSetEstimates(paresedEstimates.map((obj) => obj.theGeoEstimate));
        AnnotationStore.onInitializeEstimates(paresedEstimates);
    },

    onGeoProjectMessageHandler(response) {
        const { action, statusCode } = response;
        if (statusCode !== 200) return console.log(response.payload.message);

        switch (action) {
            case PROJECT_ACTION_NAME.CREATE:
                const {
                    payload: { projects, userId },
                } = response;
                this.onCreateProject(projects[0], userId);
                break;
            case PROJECT_ACTION_NAME.UPDATE:
                this.onUpdateProject(response);
                break;
            case PROJECT_ACTION_NAME.DELETE:
                this.onDeleteProject(response);
                break;
            default:
                return;
        }
    },
    onProjectsFetch(projects) {
        this.projects = projects;
        this.projectLoaderData.isLoading = false;
        this.trigger("projectAdded");
    },
    async fetchProjects(token) {
        await axios
            .get(`${process.env.REACT_APP_NODE_URL}/projects`, {
                headers: {
                    Authorization: token,
                },
            })
            .then((response) => {
                this.onProjectsFetch(Immutable.fromJS(response.data));
            });
    },

    onRequestInsertNewProject(projectname, projectNumber, country, departmentId, currency, units) {
        const newProjectRequest = {
            name: projectname,
            projectNumber,
            country,
            departmentId,
            projectLeaderId: AuthenticationStore.getUserId(),
            currency,
            units,
        };
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_PROJECT, { action: PROJECT_ACTION_NAME.CREATE, projects: [newProjectRequest] });
    },
    onCreateProject({ id, country, currency, name, projectLeaderId, projectNumber, units, departmentId, deleted, createdAt, projectLeaderName }, userId) {
        const department = DepartmentStore.departmentUserAccess.find((item) => item.department.id === departmentId);
        const newProject = Immutable.fromJS({
            country,
            createdAt: Date.parse(createdAt),
            currency,
            deleted,
            department: { id: departmentId, ...department.department },
            id,
            name,
            projectLeaderId,
            projectLeaderName,
            projectNumber,
            units,
        });
        this.projects = this.projects.push(newProject);
        this.trigger("projectAdded");
        if (userId === AuthenticationStore.getUserId()) this.trigger("goToDrive", newProject.get("id"));
    },
    onUpdateProject({ payload }) {
        if (payload.project?.deleted) return;

        this.projects = this.projects.map((project) => {
            if (project.get("id") === payload.project?.id) {
                const parsedProject = project.toJS();
                const { departmentId, ...parstedGeoProject } = payload.project;

                const updatedProject = {
                    ...parsedProject,
                    ...parstedGeoProject,
                };
                FileStore.changeRootFolderName(payload.project.name);
                return Immutable.fromJS(updatedProject);
            }
            return project;
        });

        this.trigger("projectUpdated");
    },

    onDeleteProject({ payload: { ids } }) {
        this.projects = this.projects.filter((project) => ids.every((id) => id !== project.get("id")));
        this.trigger("projectUpdated");
    },

    onRequestDeleteProject(projectIdList) {
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_PROJECT, { action: PROJECT_ACTION_NAME.DELETE, ids: projectIdList });
    },
    onRequestOpenProject(projectId) {
        this.setActiveProjectId(projectId);
    },

    onRequestCloseProject(projectId) {
        this.setActiveProjectId(undefined);
    },

    onRequestUpdateProject(theProject) {
        const project = Immutable.fromJS(theProject);
        let storeProject = this.getProjectById(project.get("id"));
        if (storeProject) {
            storeProject = storeProject.merge(project);
            if (storeProject.has("departmentName")) {
                storeProject = storeProject.delete("departmentName");
            }
            const updatedProjectRequest = {
                id: storeProject.get("id") << 0,
                projectNumber: storeProject.get("projectNumber"),
                name: storeProject.get("name"),
                address1: storeProject.get("address1"),
                address2: storeProject.get("address2"),
                postCode: storeProject.get("postCode"),
                city: storeProject.get("city"),
                country: storeProject.get("country"),
                projectLeaderId: storeProject.get("projectLeaderId"),
                currency: storeProject.get("currency"),
                units: storeProject.get("units"),
            };

            if (storeProject.getIn(["department", "id"]) && storeProject.getIn(["department", "id"]) << 0) {
                updatedProjectRequest.departmentId = storeProject.getIn(["department", "id"]);
            }
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_PROJECT, { action: PROJECT_ACTION_NAME.UPDATE, ...updatedProjectRequest });
        }
    },

    clearProjects() {
        this.projects = new Immutable.List();
    },
});
