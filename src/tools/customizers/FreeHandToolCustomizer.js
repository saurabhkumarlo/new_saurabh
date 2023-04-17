export default class FreeHandToolCustomizer {
    init(initializer, window) {
        const am = window.annotManager;
        window.Tools.FreeHandCreateTool.prototype.addEventListener("annotationAdded", function () {
            initializer.setIsDrawing(false);
        });
        const mouseLeftDown = window.Tools.FreeHandCreateTool.prototype.mouseLeftDown;
        window.Tools.FreeHandCreateTool.prototype.mouseLeftDown = function (event) {
            mouseLeftDown.apply(this, arguments);
            if (initializer.isSnaponEnabled()) {
                this.checkSnappy(event);
                if (this.lineAnnot) {
                    this.annotation.addPathPoint(this.lineAnnot.getStartPoint().x, this.lineAnnot.getStartPoint().y);
                    am.redrawAnnotation(this.annotation);
                } else if (this.annotation && this.annotation.snapPoint) {
                    this.annotation.addPathPoint(this.annotation.snapPoint.x, this.annotation.snapPoint.y, 0);
                    am.redrawAnnotation(this.annotation);
                }
            }
        };
        window.Tools.FreeHandCreateTool.prototype.addEventListener("annotationCreated", function (annotation) {
            initializer.setIsDrawing(true);
            annotation.FillColor = new window.Annotations.Color();
            annotation.FillColor.R = annotation.StrokeColor.R;
            annotation.FillColor.G = annotation.StrokeColor.G;
            annotation.FillColor.B = annotation.StrokeColor.B;
            annotation.FillColor.A = 0.8;
            annotation.annotationName = "";
            annotation.annotationNumber = "";
            annotation.annotationHeight = undefined;
            annotation.formulaNA = "";
            annotation.formulaNL = "";
            annotation.formulaNVO = "";
            annotation.formulaNV = "";
            annotation.style = "solid";
        });
        const freehandMouseMove = window.Tools.FreeHandCreateTool.prototype.mouseMove;
        window.Tools.FreeHandCreateTool.prototype.mouseMove = function (evt) {
            if (this.annotation && this.annotation.getPath(0) && this.annotation.getPath(0).length === 3) {
                this.annotation.StrokeColor.A = 0.01;
            }
            if (initializer.isSnaponEnabled()) {
                this.checkSnappy(evt);
                if (initializer.isSnaponEnabled() && this.annotation && (this.annotation.snapPoint || this.lineAnnot)) {
                    if (this.lineAnnot) {
                        this.annotation.addPathPoint(this.lineAnnot.getStartPoint().x, this.lineAnnot.getStartPoint().y, 0);
                        am.redrawAnnotation(this.annotation);
                    } else {
                        this.annotation.addPathPoint(this.annotation.snapPoint.x, this.annotation.snapPoint.y, 0);
                        am.redrawAnnotation(this.annotation);
                    }
                }
            } else {
                freehandMouseMove.apply(this, arguments);
            }
        };

        window.Tools.FreeHandCreateTool.prototype.mouseLeftUp = function () {
            if (this.annotation && this.annotation.getPath(0) && this.annotation.getPath(0).length > 3) {
                const firstPoint = this.annotation.getPathPoint(0, 0);
                this.annotation.addPathPoint(firstPoint.x, firstPoint.y, 0);
                this.documentViewer.getAnnotationManager().addAnnotation(this.annotation, false);
                this.annotation = undefined;
            }
        };

        window.Tools.FreeHandCreateTool.prototype.mouseDoubleClick = function () {
            // Disabled
        };

        const freehandCreateSwitchOut = window.Tools.FreeHandCreateTool.prototype.switchOut;
        window.Tools.FreeHandCreateTool.prototype.switchOut = function () {
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

            freehandCreateSwitchOut.apply(this, arguments);
        };
    }
}
