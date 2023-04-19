import { AuthenticationStore, ProjectsStore } from "stores";
import { handleGlobalKeyDown } from "./GlobalHotkeys";
import { isInputFocused } from "./hotkeys.utils";

export const handleProjectsKeyDown = (event) => {
    const role = AuthenticationStore.getRole();
    const { keyCode, ctrlKey, altKey } = event;

    if (isInputFocused(event)) return;

    handleGlobalKeyDown(event);

    switch (keyCode) {
        case 78: // N
            if (altKey && ctrlKey && role) {
                ProjectsStore.onCreateNewProject();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 79: // O
            if (ctrlKey) {
                ProjectsStore.onOpenProjects();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 46: // DELETE
            ProjectsStore.onDeleteProjects();
            event.preventDefault();
            event.stopPropagation();
            break;
        default:
            break;
    }
};
