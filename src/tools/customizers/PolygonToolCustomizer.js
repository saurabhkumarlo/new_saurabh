export default class PolygonToolCustomizer {
    constructor() {
        this.ReductionCreateTool = undefined;
    }

    init(initializer, window, calculator) {
        const polygonMouseDown = window.Tools.PolygonCreateTool.prototype.mouseLeftDown;
        window.Tools.PolygonCreateTool.prototype.mouseLeftDown = function (e) {
            polygonMouseDown.apply(this, arguments);
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

        const polygonToolMouseMove = window.Tools.PolygonCreateTool.prototype.mouseMove;
        window.Tools.PolygonCreateTool.prototype.mouseMove = function (evt) {
            if (this.annotation && this.annotation.getPath() && this.annotation.getPath().length === 3) {
                this.annotation.StrokeColor.A = 0.01;
            }
            polygonToolMouseMove.apply(this, arguments);
            if (initializer.isSnaponEnabled()) {
                this.checkSnappy(evt);
            }
        };
        const polygonToolMouseDoubleClick = window.Tools.PolygonCreateTool.prototype.mouseDoubleClick;
        window.Tools.PolygonCreateTool.prototype.mouseDoubleClick = function () {
            if (this.annotation.getPath().length === 2) {
                if (initializer.isSnaponEnabled() && this.annotation && this.annotation.snapPoint) {
                    this.annotation.popPath();
                    this.annotation.addPathPoint(this.annotation.snapPoint.x, this.annotation.snapPoint.y);
                }
                const start = this.annotation.getPathPoint(0);
                const end = this.annotation.getPathPoint(1);
                this.annotation.getPath().pop();
                this.annotation.getPath().pop();
                this.annotation.addPathPoint(start.x, start.y);
                this.annotation.addPathPoint(end.x, start.y);
                this.annotation.addPathPoint(end.x, end.y);
                this.annotation.addPathPoint(start.x, end.y);
                this.annotation.addPathPoint(start.x, start.y);
                polygonToolMouseDoubleClick.apply(this, arguments);
            } else if (this.annotation.getPath().length > 2) {
                if (initializer.isSnaponEnabled() && this.annotation && this.annotation.snapPoint) {
                    this.annotation.popPath();
                    this.annotation.addPathPoint(this.annotation.snapPoint.x, this.annotation.snapPoint.y);
                    polygonToolMouseDoubleClick.apply(this, arguments);
                } else {
                    polygonToolMouseDoubleClick.apply(this, arguments);
                }
            }
        };

        window.Tools.PolygonCreateTool.prototype.addEventListener("annotationCreated", function (annotation) {
            initializer.setIsDrawing(true);
            if (window.docViewer.getToolMode().name === "AnnotationCreatePolygon") {
                annotation.newAnnotation = true;
                annotation.StrokeThickness = 0.45;
            } else if (window.docViewer.getToolMode().name === "AnnotationCreateReduction") {
                annotation.Subject = "Reduction";
                annotation.newAnnotation = true;
                annotation.StrokeThickness = 0.45;
            }
            annotation.annotationName = "";
            annotation.annotationNumber = "";
            annotation.annotationHeight = undefined;
            annotation.pattern = "none";
            annotation.formulaNA = "";
            annotation.formulaNL = "";
            annotation.formulaNVO = "";
            annotation.formulaNV = "";
            annotation.snapGuidePoint = undefined;
            annotation.snapPoint = undefined;
            annotation.style = "solid";
        });

        window.Tools.PolygonCreateTool.prototype.addEventListener("annotationAdded", function () {
            initializer.setIsDrawing(false);
        });

        const polygonCreateSwitchOut = window.Tools.PolygonCreateTool.prototype.switchOut;
        window.Tools.PolygonCreateTool.prototype.switchOut = function () {
            if (this.lineAnnot) {
                try {
                    window.annotManager.deleteAnnotation(this.lineAnnot, true, true);
                    this.lineAnnot = undefined;
                } catch (err) {
                    console.log("Error | SnapOn (Polygon): " + err);
                }
            } else {
                if (this.annotation) {
                    this.annotation.snapPoint = undefined;
                    this.annotation.snapGuidePoint = undefined;
                }
            }

            polygonCreateSwitchOut.apply(this, arguments);
        };

        this.ReductionCreateTool = function (docViewer) {
            window.Tools.PolygonCreateTool.call(this, docViewer, window.Annotations.PolygonAnnotation);
        };
        this.ReductionCreateTool.prototype = new window.Tools.PolygonCreateTool();
        this.ReductionCreateTool.prototype.mouseLeftUp = function (e) {
            window.Tools.PolygonCreateTool.prototype.mouseLeftUp.call(this, e);
        };
    }

    getReductionCreateTool() {
        return this.ReductionCreateTool;
    }
}
