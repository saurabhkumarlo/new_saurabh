import { TOOLS } from "components/BIMer/toolbar.utils";
import { AuthenticationStore, FileStore, IfcStore } from "stores";
import { handleGlobalKeyDown } from "./GlobalHotkeys";
import { isInputFocused } from "./hotkeys.utils";

export const handleDriveMouseDown = (event) => {
    const { button } = event;
    const isActiveIfcFile = FileStore.getSelectedFiles()[0]?.type === "ifc";
    const panTool = FileStore.webViewer.docViewer.getTool(FileStore.webViewer.Tools.ToolNames.PAN);
    switch (button) {
        case 1: // SCROLL CLICK
            if (!isActiveIfcFile) {
                event.preventDefault();
                event.stopPropagation();
                FileStore.setToolMode("Pan", true);
                panTool.mouseLeftDown(event);
            }
            break;
        default:
            break;
    }
};

export const handleDriveMouseUp = (event) => {
    const { button } = event;
    const isActiveIfcFile = FileStore.getSelectedFiles()[0]?.type === "ifc";
    const panTool = FileStore.webViewer.docViewer.getTool(FileStore.webViewer.Tools.ToolNames.PAN);
    switch (button) {
        case 1: // SCROLL CLICK
            if (!isActiveIfcFile) {
                event.preventDefault();
                event.stopPropagation();
                panTool.mouseLeftUp(event);
                FileStore.backToPreviousToolMode();
            }
            break;
        default:
            break;
    }
};

export const handleDriveKeyDown = (event) => {
    const role = AuthenticationStore.getRole();
    const isActiveIfcFile = FileStore.getSelectedFiles()[0]?.type === "ifc";
    const { keyCode, ctrlKey, altKey, shiftKey } = event;

    if (isInputFocused(event)) return;

    handleGlobalKeyDown(event);

    switch (keyCode) {
        case 78: // N
            if (altKey && ctrlKey && role) {
                FileStore.onOpenFolderModal();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 85: // U
            if (ctrlKey && role) {
                FileStore.onOpenUploadModal();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 68: // D
            if (ctrlKey) {
                FileStore.onDownloadFile();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 79: // O
            if (ctrlKey) {
                FileStore.onOpenInCalculate();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 46: // DELETE
            if (!role) return;
            if (shiftKey) {
                FileStore.deleteWithoutConfirmation();
                event.preventDefault();
                event.stopPropagation();
            } else {
                if (FileStore.getCheckedItemsIds().length > 0) {
                    FileStore.showDeleteConfirmation();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            break;
        case 69: // E
            if (altKey && ctrlKey) {
                FileStore.onExpandAll();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 87: // W
            if (altKey && ctrlKey) {
                FileStore.onCollapseAll();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 48:
        case 96: // 0
            if (altKey && !isActiveIfcFile) {
                FileStore.setFitToScreen();
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.onResetView();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 49:
        case 97: // 1
            if (altKey && ctrlKey) {
                FileStore.onUpdateCheckedNodesStatuses("notStarted");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.FREE_ORBIT);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 50:
        case 98: // 2
            if (altKey && ctrlKey) {
                FileStore.onUpdateCheckedNodesStatuses("progress");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.PAN);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 51:
        case 99: // 3
            if (altKey && ctrlKey) {
                FileStore.onUpdateCheckedNodesStatuses("review");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.ZOOM);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 52:
        case 100: // 4
            if (altKey && ctrlKey) {
                FileStore.onUpdateCheckedNodesStatuses("complete");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.FIRST_PERSON);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 90: // Z
            if (altKey && !isActiveIfcFile) {
                FileStore.onSetMarqueeZoomTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        default:
            break;
    }
};
