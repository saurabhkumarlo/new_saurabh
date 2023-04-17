import { AuthenticationStore } from "stores";

export const isInputFocused = (event) => {
    const role = AuthenticationStore.getRole();

    return (
        ((event.target.tagName.toUpperCase() === "INPUT" && event.target.type.toUpperCase() !== "CHECKBOX") ||
            event.target.tagName.toUpperCase() === "TEXTAREA") &&
        event.target.placeholder !== "Reply..."
    );
};
