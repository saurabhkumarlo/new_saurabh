import { createStore } from "reflux";

export default createStore({
    listenables: [],
    init() {
        this.appSearch = "";
    },
    setAppSearch(appSearch) {
        this.appSearch = appSearch;
        this.trigger("appSearchUpdated");
    },
    onFocusSearchInput() {
        this.trigger("focusSearchInput");
    },
    showFeedbackDialog() {
        this.trigger("showFeedbackDialog");
    },
    getAppSearch() {
        return this.appSearch;
    },
});
