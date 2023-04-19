import { createStore } from "reflux";
import Immutable from "immutable";
import axios from "axios";

import SocketV2Store from "./SocketV2Store";
import AuthenticationStore from "./AuthenticationStore";
import { FileActions, MessageHandlerV2Actions, SocketV2Actions } from "../actions";
import { ProjectsStore, TemplatesStore, FileStore } from ".";
import AnnotationStore from "./AnnotationStore";

export default createStore({
    listenables: [MessageHandlerV2Actions],

    init() {
        this.messageStack = new Immutable.Stack();
        this.listenables = MessageHandlerV2Actions;
    },

    onSendUpdate(body) {
        this.messageStack = this.messageStack.push(body);
        if (AuthenticationStore.getJwt() && SocketV2Store.socket === null) {
            SocketV2Store.onInitSocket();
        }
        if (SocketV2Store.socket) {
            for (let i = 0; this.messageStack.size > 0; i++) {
                SocketV2Actions.sendMessage(this.messageStack.first());
                this.messageStack = this.messageStack.pop();
            }
        }
    },

    onMessageReceived(receivedMessage) {
        switch (receivedMessage.action) {
            case "file_uploaded":
                FileActions.addNodeToTree(receivedMessage.payload, false, receivedMessage.payload.name);
                const loaderData = FileStore.getMultipleFilesDataLoader();
                if (loaderData.wanted > 0) {
                    FileStore.multipleFilesLoaderHandler();
                }
                break;
            case "conversion_notification":
                axios
                    .get(`${process.env.REACT_APP_NODE_URL}/files`, {
                        params: {
                            projectId: ProjectsStore.getActiveProjectId(),
                        },
                        headers: {
                            Authorization: AuthenticationStore.getJwt(),
                        },
                    })
                    .then(({ data }) => {
                        FileActions.buildTree(data);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                break;
            case "file_deleted":
                if (AnnotationStore.getProjectIdFromEstimateId() === receivedMessage.payload.geoProjectId)
                    AnnotationStore.onDeleteFileHandler(receivedMessage.payload.id);
                FileActions.addNodeToTree(receivedMessage.payload, true, receivedMessage.payload.name);
                break;
            case "delete_files":
                if (receivedMessage.projectId === ProjectsStore.getActiveProjectId()) {
                    FileActions.buildTree(receivedMessage.payload);
                }
                break;
            case "delete_folder":
                if (AnnotationStore.getProjectIdFromEstimateId() === receivedMessage.projectId) {
                    AnnotationStore.onDeleteDriveFolderHandler(receivedMessage.deletedFileIds);
                    FileActions.buildTree(receivedMessage.payload);
                }
                FileStore.updateFileState();
                break;
            case "add_template":
                TemplatesStore.onAddTemplate(receivedMessage.payload, receivedMessage.type);
                break;
            case "delete_template":
                TemplatesStore.onDeleteTemplate(receivedMessage.payload, receivedMessage.type);
                break;
            case "duplicate_template":
                TemplatesStore.onDuplicateTemplate(receivedMessage.payload, receivedMessage.type);
                break;
            case "update_template":
                TemplatesStore.onUpdateTemplate(receivedMessage.payload, receivedMessage.type);
                break;
            case "add_template_folder":
                TemplatesStore.onAddTemplateFolder(receivedMessage.payload, receivedMessage.type);
                break;
            case "add_template_to_calculate_folder":
                TemplatesStore.onAddCalcTemplateToFolder();
                break;
            case "add_template_to_drive_folder":
                TemplatesStore.onAddDriveTemplateToFolder(receivedMessage.payload, receivedMessage.type);
                break;
            case "delete_template_folder":
                TemplatesStore.onDeleteTemplateFolder(receivedMessage.payload, receivedMessage.type);
                break;
            case "update_template_folder":
                TemplatesStore.onUpdateTemplateFolder({ folder: receivedMessage.payload, type: receivedMessage.type });
                break;
            default:
                console.log("message hander lssr did not handle message: ", receivedMessage);
        }
    },
});
