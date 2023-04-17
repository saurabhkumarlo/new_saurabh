import { createStore } from "reflux";

export default createStore({
    listenables: [],

    init() {
        this.iconBaselineNewReleases24px =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="green" fill-opacity="0.4" d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
        this.baselineRemoveCircleOutline24px =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="green" fill-opacity="0.4" d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
        this.baselineRoom24px =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="green" fill-opacity="0.4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
        this.baselineStarRate24px =
            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path fill="green" fill-opacity="0.4" d="M9 11.3l3.71 2.7-1.42-4.36L15 7h-4.55L9 2.5 7.55 7H3l3.71 2.64L5.29 14z"/><path fill="none" d="M0 0h18v18H0z"/></svg>';
        this.baselineToys24px =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="green" fill-opacity="0.4" d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12zm0 0c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11zm0 0c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11zm0 0c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z"/><path fill="none" d="M0 0h24v24H0z"/></svg>';
    },

    getIcon(iconString) {
        switch (iconString) {
            case "iconBaselineNewReleases24px":
                return this.iconBaselineNewReleases24px;
            case "baselineRemoveCircleOutline24px":
                return this.baselineRemoveCircleOutline24px;
            case "baselineRoom24px":
                return this.baselineRoom24px;
            case "baselineStarRate24px":
                return this.baselineStarRate24px;
            case "baselineToys24px":
                return this.baselineToys24px;
            default:
                console.log("Could not find case for IconType in IconTypeStore.  " + iconString);
        }
    },
});
