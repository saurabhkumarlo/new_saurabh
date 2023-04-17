import { ProjectsStore, TemplatesStore } from "../../stores";

import { MessageHandlerV2Actions } from "../../actions";
import React from "react";
import TemplatesDialog from "./TemplatesDialog";
import { withTranslation } from "react-i18next";

class RefluxWrapper extends React.Component {
    state = {
        isAdding: false,
        isAddingFolder: false,
        idUpdating: "",
        templates: [],
        activeTemplate: {},
        selectedNodeId: undefined,
        companyId: "",
    };

    componentDidMount() {
        if (this.props.type === "drive") {
            this.setState({
                companyId: ProjectsStore.getActiveProject().toJS().department.company.id,
                templates: TemplatesStore.getDriveTemplates(),
                activeTemplate: TemplatesStore.getActiveDriveTemplate(),
            });
        } else {
            this.setState({
                companyId: ProjectsStore.getActiveProject().toJS().department.company.id,
                templates: TemplatesStore.getCalcTemplates(),
                activeTemplate: TemplatesStore.getActiveCalcTemplate(),
            });
        }
        this.unsubscribeEstimateStore = TemplatesStore.listen(this.templatesStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeEstimateStore();
    }

    templatesStoreUpdated = (message) => {
        switch (message) {
            case "updateCalcTemplates":
                this.setState({
                    templates: TemplatesStore.getCalcTemplates(),
                    activeTemplate: TemplatesStore.getActiveCalcTemplate(),
                    isAdding: false,
                    isAddingFolder: false,
                    idUpdating: "",
                });
                break;
            case "updateDriveTemplates":
                this.setState({
                    templates: TemplatesStore.getDriveTemplates(),
                    activeTemplate: TemplatesStore.getActiveDriveTemplate(),
                    isAdding: false,
                    isAddingFolder: false,
                    idUpdating: "",
                });
                break;
            case "updateActiveCalcTemplate":
                this.setState({ activeTemplate: TemplatesStore.getActiveCalcTemplate() });
                break;
            case "updateActiveDriveTemplate":
                this.setState({ activeTemplate: TemplatesStore.getActiveDriveTemplate() });
                break;
            case "onDeleteTemplateFolder":
                this.setState({
                    selectedNodeId: undefined,
                });
                break;
            default:
                break;
        }
    };

    onChangeActiveTemplate = (item) => {
        if (item.id !== this.state.activeTemplate.id) {
            if (item.type === "drive") {
                TemplatesStore.setActiveDriveTemplate(item);
                this.setState({ selectedNodeId: undefined });
            } else {
                TemplatesStore.setActiveCalcTemplate(item);
                this.setState({ selectedNodeId: undefined });
            }
        }
    };

    onAddTemplate = () => {
        this.setState({ isAdding: true });
        MessageHandlerV2Actions.sendUpdate({
            action: "add_template",
            companyId: this.state.companyId,
            name: this.props.t("GENERAL.NEW_TEMPLATE"),
            type: this.props.type,
        });
    };

    onDeleteTemplate = (id, companyId) => {
        this.setState({ idUpdating: id });
        MessageHandlerV2Actions.sendUpdate({ action: "delete_template", id: id, type: this.props.type, companyId });
    };

    onDuplicateTemplate = (id, companyId) => {
        this.setState({ idUpdating: id });
        MessageHandlerV2Actions.sendUpdate({ action: "duplicate_template", id: id, type: this.props.type, companyId });
    };

    onUpdateTemplate = (id, name, companyId) => {
        this.setState({ idUpdating: id });
        MessageHandlerV2Actions.sendUpdate({ action: "update_template", id: id, name: name, type: this.props.type, companyId });
    };

    onAddFolder = (parentId, name, companyId) => {
        this.setState({ idUpdating: this.state.activeTemplate.id, isAddingFolder: true });
        if (parentId) {
            MessageHandlerV2Actions.sendUpdate({
                action: "add_template_folder",
                templateId: this.state.activeTemplate.id,
                parentId: parentId,
                name: name,
                type: this.props.type,
                companyId,
            });
        } else {
            MessageHandlerV2Actions.sendUpdate({
                action: "add_template_folder",
                templateId: this.state.activeTemplate.id,
                name: name,
                type: this.props.type,
                companyId,
            });
        }
    };

    onUpdateFolder = (id, value, parentId, object, companyId) => {
        this.setState({ idUpdating: this.state.activeTemplate.id });
        if (object && value) {
            MessageHandlerV2Actions.sendUpdate({ action: "update_template_folder", id: id, [object]: value, type: this.props.type, companyId });
        } else if (!object && !value) {
            MessageHandlerV2Actions.sendUpdate({ action: "update_template_folder", id: id, parentId: parentId, type: this.props.type, companyId });
        }
    };

    onDeleteFolder = (id, companyId) => {
        this.setState({ idUpdating: this.state.activeTemplate.id, selectedNodeId: undefined });
        MessageHandlerV2Actions.sendUpdate({
            action: "delete_template_folder",
            id,
            templateId: this.state.activeTemplate.id,
            type: this.props.type,
            companyId,
        });
    };

    onChangeSelectedNodeId = (id) => {
        this.setState({ selectedNodeId: id });
    };

    render() {
        const { visible, onCancel, onAccept, type } = this.props;
        const { isAdding, isAddingFolder, idUpdating, templates, selectedNodeId, companyId, activeTemplate } = this.state;

        return (
            <TemplatesDialog
                visible={visible}
                onCancel={onCancel}
                onAccept={onAccept}
                isAdding={isAdding}
                isAddingFolder={isAddingFolder}
                idUpdating={idUpdating}
                selectedNodeId={selectedNodeId}
                companyId={companyId}
                templates={templates}
                type={type}
                activeTemplate={activeTemplate}
                onChangeActiveTemplate={this.onChangeActiveTemplate}
                onAddTemplate={this.onAddTemplate}
                onDeleteTemplate={(id) => this.onDeleteTemplate(id, companyId)}
                onDuplicateTemplate={(id) => this.onDuplicateTemplate(id, companyId)}
                onUpdateTemplate={(id, name) => this.onUpdateTemplate(id, name, companyId)}
                onAddFolder={(parentId, name) => this.onAddFolder(parentId, name, companyId)}
                onUpdateFolder={(id, value, parentId, object) => this.onUpdateFolder(id, value, parentId, object, companyId)}
                onDeleteFolder={(id) => this.onDeleteFolder(id, companyId)}
                onChangeSelectedNodeId={this.onChangeSelectedNodeId}
            />
        );
    }
}

export default withTranslation()(RefluxWrapper);
