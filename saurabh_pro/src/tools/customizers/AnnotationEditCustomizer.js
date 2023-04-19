import AnnotationStore from "../../stores/AnnotationStore";

export default class AnnotationEditCustomizer {
    init(window, calculator) {
        let myKeyUpLock = false;
        const annotationEditMouseDown = window.Tools.AnnotationEditTool.prototype.mouseLeftDown;
        // Added to avoid the PdfTron defualt copy behaviour.
        // Alt-key + mouseLefDown => Annotaiotn copy.
        window.Tools.AnnotationEditTool.prototype.mouseLeftDown = function (e) {
            if (e.altKey) {
                myKeyUpLock = true;
                this.mouseLeftUp(e);
                myKeyUpLock = false;
            } else {
                annotationEditMouseDown.call(this, e);
            }
        };

        const annotationEditMouseUp = window.Tools.AnnotationEditTool.prototype.mouseLeftUp;
        window.Tools.AnnotationEditTool.prototype.mouseLeftUp = function (e) {
            e.stopPropagation();
            // This is AnnotationSelectTool doubling the call
            if (e.altKey && !myKeyUpLock) {
                return;
            }
            if (e.shiftKey || e.altKey) {
                const am = window.annotManager;
                const selected = am.getSelectedAnnotations();
                if (selected.length === 1 && (selected[0].Subject === "Polyline" || selected[0].Subject === "Polygon" || selected[0].Subject === "Reduction")) {
                    if (e.shiftKey && e.altKey) {
                        const pointIndex = calculator.getClosestPointIndex(this.pageCoordinates[1], selected[0]);
                        if (pointIndex >= 0) {
                            const path = selected[0].getPath();
                            switch (selected[0].Subject) {
                                case "Polygon":
                                case "Reduction":
                                    if (path.length > 4) {
                                        // We need at least as rectangle
                                        AnnotationStore.removePointFromAnnotationFromConfig(selected[0], pointIndex);
                                    }
                                    break;
                                case "Polyline":
                                    if (path.length > 2) {
                                        // We need two points
                                        AnnotationStore.removePointFromAnnotationFromConfig(selected[0], pointIndex);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    } else if (e.altKey) {
                        const pointIndex = calculator.getPathIndex(this.pageCoordinates[1], selected[0]);
                        if (pointIndex >= 0) {
                            am.redrawAnnotation(selected[0]);
                            const currentPageNumber = window.docViewer.getCurrentPage();
                            const pdfCoords = window.docViewer
                                .getDocument()
                                .getPDFCoordinates(currentPageNumber, this.pageCoordinates[1].x, this.pageCoordinates[1].y);
                            AnnotationStore.addPointToAnnotationFromConfig(selected[0], pdfCoords, pointIndex);
                        }
                    }
                }
            }
            annotationEditMouseUp.apply(this, arguments);
        };
    }
}
