import { createActions } from "reflux";

const AppBarActions = createActions([
    "openProjectButtonClicked",
    "openProjectInNewWindowButtonClicked",
    "newProjectButtonClicked",
    "deleteProjectsButtonClicked",
    "filterProjectsButtonClicked",
    "removeFilterProjectsButtonClicked",
    "helpButtonClicked",
    "setOpenProjectBlur",
    "setOpenProjectInNewWindowBlur",
    "setProjectState",
    "uploadFileClicked",
    "downloadFilesClicked",
    "deleteFileClicked",
    "addFolderClicked",
    "setFilesState",
    "selectDrawingOnMapClicked",
    "openCalculationClicked",
    "drawAreaButtonClicked",
    "drawLineButtonClicked",
    "drawPointButtonClicked",
    "drawFreehandButtonClicked",
    "drawCircleButtonClicked",
    "drawScaleButtonClicked",
    "commentButtonClicked",
    "search",
    "searchEstimate",
    "rotateMapButtonClicked",
    "fitToScreenButtonClicked",
    "zoomInButtonClicked",
    "zoomOutButtonClicked",
    "createFolderButtonClicked",
    "pageChanged",
    "pageChangedByFeatureTable",
    "updateButtonState",
    "editDrawingButtonClicked",
    "deleteCalculationRowClicked",
    "addCalculationRowClicked",
    "exportButtonClicked",
    "focusSearchField",
    "focusSearchFieldEstimate",
    "printMapButtonClicked",
    "saveToPDFButtonClicked",
    "enableReductionDrawingTool",
    "disableReductionDrawingTool",
    "drawAreaReductionClicked",
    "feedbackButtonClicked",
    "supportButtonClicked",
    "panButtonClicked",
    "copyButtonClicked",
    "pasteButtonClicked",
    "duplicateButtonClicked",
    "setSelectState",
    "deleteAnnotations",
    "toggleEstimateRows",
    "togglePropertiesPane",
    "togglePDFView",
    "toggleSnapon",
]);

export default AppBarActions;
