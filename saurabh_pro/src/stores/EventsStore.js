import { createStore } from "reflux";

export default createStore({
    init() {
        this.contextMenuCalculateRowsOpen = false;
    },

    isContextMenuCalculateRowsOpen() {
        return this.contextMenuCalculateRowsOpen;
    },

    setContextMenuCalculateRowsOpen(value) {
        this.contextMenuCalculateRowsOpen = value;
    },
});
