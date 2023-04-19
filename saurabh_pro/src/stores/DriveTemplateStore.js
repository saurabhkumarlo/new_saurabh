import { actions } from "../constants/MessageConstants";

import DrivTemplateActions from "../actions/DriveTemplateActions";
import Immutable from "immutable";
import { createStore } from "reflux";

export default createStore({
    init() {
        this.driveTemplates = undefined;
        this.listenables = DrivTemplateActions;
    },

    getTemplates() {
        return this.driveTemplates;
    },

    getTemplateByTemplateId(templateId) {
        return this.driveTemplates.find((driveTemplate) => driveTemplate.getIn(["template", "templateId"]) === templateId);
    },

    onMessageReceived(message) {
        switch (message.action) {
            case actions.selectArray:
                this.driveTemplates = Immutable.fromJS(message.payload.driveTemplateList);
                this.driveTemplates = this.driveTemplates.map((driveTemplate) => {
                    const parsedTemplate = Immutable.fromJS(JSON.parse(driveTemplate.get("template")));
                    driveTemplate = driveTemplate.set("template", parsedTemplate);
                    driveTemplate = driveTemplate.setIn(["template", "templateId"], "" + driveTemplate.get("id"));
                    return driveTemplate;
                });
                this.trigger("selectAllDriveTemplates");
                break;
            case actions.insert:
                let newDriveTemplate = Immutable.fromJS(message.payload.driveTemplate);
                newDriveTemplate = newDriveTemplate.set("template", Immutable.fromJS(JSON.parse(newDriveTemplate.get("template"))));
                newDriveTemplate = newDriveTemplate.setIn(["template", "templateId"], "" + newDriveTemplate.get("id"));
                this.driveTemplates = this.driveTemplates.push(newDriveTemplate);
                this.trigger("driveTemplateInserted");
                break;
            case actions.update:
                let updatedTemplate = Immutable.fromJS(message.payload.driveTemplate);
                updatedTemplate = updatedTemplate.set("template", Immutable.fromJS(JSON.parse(updatedTemplate.get("template"))));
                this.driveTemplates = this.driveTemplates.map((driveTemplate) => {
                    if (driveTemplate.get("id") === updatedTemplate.get("id")) {
                        return driveTemplate.merge(updatedTemplate);
                    }
                    return driveTemplate;
                });
                this.trigger("driveTemplateInserted");
                break;
            case actions.delete:
                const deletedList = message.payload.ids;
                this.driveTemplates = this.driveTemplates.filter((driveTemplate) => !deletedList.includes(driveTemplate.get("id")));
                this.trigger("driveTemplateDeleted");
                break;
            default:
                break;
        }
    },

    triggerLoadTemplates() {
        this.trigger("loadTemplates");
    },
});
