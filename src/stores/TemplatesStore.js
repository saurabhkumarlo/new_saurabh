import { createStore } from "reflux";
import { map, forEach, sortBy } from "lodash";
import axios from "axios";

import { CalculationActions, TemplateActions } from "../actions";
import { ProjectsStore } from "./";
import FileStore from "./FileStore";
import AuthenticationStore from "./AuthenticationStore";

export default createStore({
    listenables: [TemplateActions],

    init() {
        this.calcTemplates = [];
        this.activeCalcTemplate = {};
        this.driveTemplates = [];
        this.activeDriveTemplate = {};
    },

    onRequestTemplates() {
        axios
            .get(`${process.env.REACT_APP_NODE_URL}/templates`, {
                headers: {
                    Authorization: AuthenticationStore.getJwt(),
                },
            })
            .then((response) => {
                this.onSetDriveTemplates(response.data.driveTemplates);
                this.onSetCalculateTemplates(response.data.calculateTemplates);
                CalculationActions.updateRowTemplate(response.data.rowTemplates);
            })
            .catch((error) => {
                console.log(error);
            });
    },

    onSetCalculateTemplates(templates) {
        this.calcTemplates = templates;
        this.activeCalcTemplate = templates[0];

        this.trigger("updateCalcTemplates");
    },

    onSetDriveTemplates(templates) {
        this.driveTemplates = templates;
        this.activeDriveTemplate = templates[0];

        this.trigger("updateDriveTemplates");
    },

    getCalcTemplates() {
        return this.calcTemplates;
    },

    getDriveTemplates() {
        return this.driveTemplates;
    },

    getTemplateIndex(templateId, type) {
        if (type === "drive") return this.driveTemplates.findIndex((obj) => obj.id == templateId);
        else return this.calcTemplates.findIndex((obj) => obj.id == templateId);
    },

    getActiveCalcTemplate() {
        return this.activeCalcTemplate;
    },

    setActiveCalcTemplate(template) {
        this.activeCalcTemplate = template;

        this.trigger("updateActiveCalcTemplate");
    },

    getActiveDriveTemplate() {
        return this.activeDriveTemplate;
    },

    setActiveDriveTemplate(template) {
        this.activeDriveTemplate = template;

        this.trigger("updateActiveDriveTemplate");
    },

    onAddTemplate(template) {
        if (template.type === "drive") {
            if (this.driveTemplates.length === 0) this.setActiveDriveTemplate(template);
            this.driveTemplates.push(template);
            this.trigger("updateDriveTemplates");
        } else {
            if (this.calcTemplates.length === 0) this.setActiveCalcTemplate(template);
            this.calcTemplates.push(template);
            this.trigger("updateCalcTemplates");
        }
    },

    onDeleteTemplate(template) {
        if (template.type === "drive") {
            this.driveTemplates = this.driveTemplates.filter((item) => item.id !== template.id);

            if (template.id === this.activeDriveTemplate.id) {
                this.activeDriveTemplate = this.driveTemplates[0];
            }
            this.trigger("updateDriveTemplates");
        } else {
            this.calcTemplates = this.calcTemplates.filter((item) => item.id !== template.id);

            if (template.id === this.activeCalcTemplate.id) {
                this.activeCalcTemplate = this.calcTemplates[0];
            }
            this.trigger("updateCalcTemplates");
        }
    },

    onDuplicateTemplate(template) {
        if (template.type === "drive") {
            this.driveTemplates.push(template);

            this.trigger("updateDriveTemplates");
        } else {
            this.calcTemplates.push(template);

            this.trigger("updateCalcTemplates");
        }
    },

    onUpdateTemplate(template, type) {
        if (template.type === "drive") {
            this.driveTemplates[this.getTemplateIndex(template.id, type)].name = template.name;

            if (template.id === this.activeDriveTemplate.id) {
                this.activeDriveTemplate.name = template.name;
            }

            this.trigger("updateDriveTemplates");
        } else {
            this.calcTemplates[this.getTemplateIndex(template.id, type)].name = template.name;

            if (template.id === this.activeCalcTemplate.id) {
                this.activeCalcTemplate.name = template.name;
            }

            this.trigger("updateCalcTemplates");
        }
    },

    onAddTemplateFolder(folder, type) {
        if (type === "drive") {
            this.driveTemplates[this.getTemplateIndex(folder.geoTemplateId, type)].folders.push(folder);
            this.trigger("updateDriveTemplates");
        } else {
            this.calcTemplates[this.getTemplateIndex(folder.geoTemplateId, type)].folders.push(folder);
            this.trigger("updateCalcTemplates");
        }
    },

    onAddCalcTemplateToFolder() {
        ProjectsStore.onRequestProject(ProjectsStore.getActiveProjectId());
    },

    onAddDriveTemplateToFolder() {
        axios
            .get(`${process.env.REACT_APP_NODE_URL}/files`, {
                params: { projectId: ProjectsStore.getActiveProjectId() },
                headers: {
                    Authorization: AuthenticationStore.getJwt(),
                },
            })
            .then(({ data }) => {
                FileStore.onBuildTree(data);
            })
            .catch((error) => {
                console.log(error);
            });
    },

    onUpdateTemplateFolder({ folder, type }) {
        if (type === "drive") {
            const templateId = this.getTemplateIndex(folder.geoTemplateId, type);
            const folderId = this.driveTemplates[templateId].folders.findIndex((item) => item.id === folder.id);
            this.driveTemplates[templateId].folders[folderId] = folder;

            const activeFolderId = this.activeDriveTemplate.folders.findIndex((item) => item.id === folder.id);
            this.activeDriveTemplate.folders[activeFolderId] = folder;

            this.trigger("updateDriveTemplates");
        } else {
            const templateId = this.getTemplateIndex(folder.geoTemplateId, type);
            const folderId = this.calcTemplates[templateId].folders.findIndex((item) => item.id === folder.id);
            this.calcTemplates[templateId].folders[folderId] = folder;

            const activeFolderId = this.activeCalcTemplate.folders.findIndex((item) => item.id === folder.id);
            this.activeCalcTemplate.folders[activeFolderId] = folder;

            this.trigger("updateCalcTemplates");
        }
    },

    onDeleteTemplateFolder(folders, type) {
        if (type === "drive") {
            this.activeDriveTemplate.folders = folders;
            this.trigger("updateDriveTemplates");
            this.trigger("onDeleteTemplateFolder");
        } else {
            this.activeCalcTemplate.folders = folders;
            this.trigger("updateCalcTemplates");
            this.trigger("onDeleteTemplateFolder");
        }
    },

    buildTreeStructure(files) {
        let root = [];
        const newFiles = map(sortBy(files, ["tag", "name"]), (item) => ({
            parentId: item.parentId,
            id: item.id,
            title: item.name,
            key: item.id,
            children: [],
            name: item.name,
            templateId: item.geoTemplateId,
            tag: item.tag,
        }));
        const idMapping = newFiles.reduce((acc, el, i) => {
            acc[el.id] = i;
            return acc;
        }, {});
        forEach(newFiles, (el) => {
            if (el.parentId === null) {
                root.push(el);
                return;
            }
            const parentEl = newFiles[idMapping[el.parentId]];
            parentEl.children = [...(parentEl.children || []), el];
        });
        return root;
    },
});
