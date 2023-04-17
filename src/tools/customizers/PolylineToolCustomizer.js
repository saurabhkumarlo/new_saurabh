import AnnotationStore from "../../stores/AnnotationStore";

export default class PolylineToolCustomizer {
    constructor() {
        this.ScaleCreateTool = undefined;
    }

    init(initializer, window, calculator) {
        // window.Tools.PolylineCreateTool.enableImmediateActionOnAnnotationSelection();
        const polylineMouseMove = window.Tools.PolylineCreateTool.prototype.mouseMove;
        const polylineMouseLeftDown = window.Tools.PolylineCreateTool.prototype.mouseLeftDown;
        const polylineMouseDoubleClick = window.Tools.PolylineCreateTool.prototype.mouseDoubleClick;
        const polylineCreateSwitchOut = window.Tools.PolylineCreateTool.prototype.switchOut;

        window.Tools.PolylineCreateTool.prototype.mouseMove = function (evt) {
            polylineMouseMove.apply(this, arguments);
            if (initializer.isSnaponEnabled()) {
                this.checkSnappy(evt);
            }
        };

        window.Tools.PolylineCreateTool.prototype.mouseLeftDown = function () {
            if (!initializer.isDrawing()) {
                window.annotManager.deselectAllAnnotations();
            }
            polylineMouseLeftDown.apply(this, arguments);
            if (initializer.isSnaponEnabled() && this.annotation && (this.annotation.snapPoint || this.lineAnnot)) {
                if (this.lineAnnot) {
                    this.annotation.popPath();
                    this.annotation.addPathPoint(this.lineAnnot.getStartPoint().x, this.lineAnnot.getStartPoint().y);
                    window.annotManager.redrawAnnotation(this.annotation);
                } else {
                    this.annotation.popPath();
                    this.annotation.addPathPoint(this.annotation.snapPoint.x, this.annotation.snapPoint.y);
                    window.annotManager.redrawAnnotation(this.annotation);
                }
            }
        };

        window.Tools.PolylineCreateTool.prototype.mouseDoubleClick = function (evt) {
            if (initializer.isSnaponEnabled() && this.annotation && this.annotation.snapPoint) {
                this.annotation.popPath();
                this.annotation.addPathPoint(this.annotation.snapPoint.x, this.annotation.snapPoint.y);
                polylineMouseDoubleClick.apply(this, arguments);
            } else {
                polylineMouseDoubleClick.apply(this, arguments);
            }
        };

        window.Tools.PolylineCreateTool.prototype.addEventListener("annotationAdded", function () {
            initializer.setIsDrawing(false);
        });

        window.Tools.PolylineCreateTool.prototype.addEventListener("annotationCreated", function (annotation) {
            initializer.setIsDrawing(true);
            if (window.docViewer.getToolMode().name === "AnnotationCreatePolyline") {
                annotation.newAnnotation = true;
                annotation.StrokeThickness = 0.45;
                annotation.formulaNL = "";
                annotation.formulaNV = "";
                annotation.snapGuidePoint = undefined;
                annotation.snapPoint = undefined;
            } else if (window.docViewer.getToolMode().name === "AnnotationCreateScale") {
                annotation.Subject = "x-scale";
                annotation.newScale = true;
                annotation.showLengths = false;
            }
            annotation.style = "solid";
        });

        window.Tools.PolylineCreateTool.prototype.switchOut = function () {
            if (this.lineAnnot) {
                try {
                    window.annotManager.deleteAnnotation(this.lineAnnot, true, true);
                    this.lineAnnot = undefined;
                } catch (err) {
                    console.log("Error |  SnapOn (Polyline): " + err);
                }
            } else {
                if (this.annotation) {
                    this.annotation.snapPoint = undefined;
                    this.annotation.snapGuidePoint = undefined;
                }
            }

            polylineCreateSwitchOut.apply(this, arguments);
        };

        this.ScaleCreateTool = function (docViewer) {
            window.Tools.PolylineCreateTool.call(this, docViewer, window.Annotations.PolylineAnnotation);
        };
        this.ScaleCreateTool.prototype = new window.Tools.PolylineCreateTool();

        this.ScaleCreateTool.prototype.mouseLeftDown = function (e) {
            if (!initializer.isDrawing()) {
                window.annotManager.deselectAllAnnotations();
            }
            window.Tools.PolylineCreateTool.prototype.mouseLeftDown.apply(this, arguments);
            if (this.annotation && this.annotation.getPath() && this.annotation.getPath().length === 2) {
                if (
                    (e.altKey || AnnotationStore.useYScaleOnly) &&
                    (calculator.getScale(window.docViewer.getCurrentPage()) || AnnotationStore.getCreateYScale())
                ) {
                    this.annotation.Subject = "y-scale";
                    this.annotation.length = 1;
                    this.annotation.StrokeColor = new window.Annotations.Color(0, 0, 204);
                    this.annotation.strokeSize = 1;
                    AnnotationStore.setCreateYScale(false);
                } else {
                    this.annotation.Subject = "x-scale";
                    this.annotation.length = 1;
                    this.annotation.strokeSize = 1;
                }
                initializer.setIsDrawing(false);
                window.annotManager.addAnnotation(this.annotation, false);
                this.annotation = undefined;
            }
        };

        this.ScaleCreateTool.prototype.mouseDoubleClick = function (evt) {
            if (
                (evt.altKey || AnnotationStore.useYScaleOnly) &&
                (calculator.getScale(window.docViewer.getCurrentPage()) || AnnotationStore.getCreateYScale())
            ) {
                this.annotation.Subject = "y-scale";
                this.annotation.length = 1;
                this.annotation.StrokeColor = new window.Annotations.Color(0, 0, 204);
                this.annotation.strokeSize = 1;
            } else {
                this.annotation.Subject = "x-scale";
                this.annotation.length = 1;
                this.annotation.strokeSize = 1;
            }
            if (initializer.isSnaponEnabled() && this.annotation && this.annotation.snapPoint) {
                window.Tools.PolylineCreateTool.prototype.mouseDoubleClick.apply(this, arguments);
            } else {
                polylineMouseDoubleClick.apply(this, arguments);
            }
        };
    }

    getScaleCreateTool() {
        return this.ScaleCreateTool;
    }
}
