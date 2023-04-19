import { HeaderStore } from "stores";

export const handleGlobalKeyDown = (event) => {
    const { keyCode, ctrlKey, altKey, shiftKey } = event;

    switch (keyCode) {
        case 70: // F
            if (altKey && ctrlKey) {
                HeaderStore.showFeedbackDialog();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 32: // SPACE
            if (shiftKey) {
                HeaderStore.onFocusSearchInput();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        default:
            break;
    }
};
