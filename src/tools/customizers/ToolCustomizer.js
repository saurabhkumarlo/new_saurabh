import AnnotationStore from "../../stores/AnnotationStore";

//import TreeStore from './../../stores/FancytreeStore';

export default class ToolCustomizer {
    init(window, calculator) {
        //window.Tools.Tool.ENABLE_ANNOTATION_HOVER_CURSORS = false;
        window.Tools.Tool.ENABLE_TEXT_SELECTION = false;
        // window.Tools.Tool.ENABLE_AUTO_SWITCH = false;

        //const readerControl = window.readerControl;

        const toolMouseLeftDown = window.Tools.Tool.prototype.mouseLeftDown;
        window.Tools.Tool.prototype.mouseLeftDown = function () {
            //Enable draw on top of newly created annotation
            switch (window.docViewer.getToolMode().name) {
                case "AnnotationCreatePoint":
                case "AnnotationCreatePolyline":
                case "AnnotationCreatePolygon":
                case "AnnotationCreateEllipse":
                case "AnnotationCreateReduction":
                case "AnnotationCreateFreeHand":
                case "AnnotationCreateScale":
                case "AnnotationCreateFreeText":
                case "AnnotationCreateArrow":
                    if (!this.annotation) {
                        window.annotManager.deselectAllAnnotations();
                    }
                    break;
                default:
                    break;
            }
            toolMouseLeftDown.apply(this, arguments);
        };

        window.Tools.Tool.prototype.angleMouseMove = function (evt) {
            const am = window.annotManager;
            let currenLoc = this.getMouseLocation(evt);
            const displayMode = window.docViewer.getDisplayModeManager().getDisplayMode();
            const pageNumber = window.docViewer.getCurrentPage();
            currenLoc = displayMode.windowToPage(currenLoc, pageNumber);
            if (this.previousLoc) {
                const dx = currenLoc.x - this.previousLoc.x; // rotation dx
                const dy = currenLoc.y - this.previousLoc.y; // rotation dy
                const currentRotation = (Math.atan2(dy, dx) * 180) / Math.PI;
                let rotationValue = undefined;
                if (currentRotation <= 0) {
                    rotationValue = Math.abs(currentRotation);
                } else if (currentRotation > 0) {
                    rotationValue = 360 - currentRotation;
                }
                if (!this.previousRotation) {
                    this.previousRotation = currentRotation;
                    this.rotation = calculator.getDegreStepRotation(rotationValue);
                }
                if (Math.abs(currentRotation - this.previousRotation) > 3.75) {
                    this.previousRotation = currentRotation;
                    this.rotation = calculator.getDegreStepRotation(rotationValue);
                }

                const firstPoint = this.annotation.getPathPoint(this.annotation.getPath().length - 2);
                const secondPoint = this.annotation.getPathPoint(this.annotation.getPath().length - 1);

                this.rotatedPoint = calculator.getRotatedPoint(firstPoint, secondPoint, this.rotation);
                this.annotation.popPath();
                this.annotation.addPathPoint(this.rotatedPoint.x, this.rotatedPoint.y);

                am.redrawAnnotation(this.annotation);
            }
        };

        window.Tools.Tool.prototype.angleMouseLeftDown = function (evt, startLength) {
            if (this.annotation) {
                this.previousLoc = this.annotation.getPathPoint(this.annotation.getPath().length - 1);
            } else {
                this.previousLoc = undefined;
            }
            if (this.rotation === undefined) {
                this.rotation = 0;
            }
            if (evt.ctrlKey && this.annotation && this.annotation.getPath().length > startLength) {
                const firstPoint = this.annotation.getPathPoint(this.annotation.getPath().length - 2);
                const secondPoint = this.annotation.getPathPoint(this.annotation.getPath().length - 1);
                this.rotatedPoint = calculator.getRotatedPoint(firstPoint, secondPoint, this.rotation);
                this.annotation.popPath();
                this.annotation.addPathPoint(this.rotatedPoint.x, this.rotatedPoint.y);
                const am = window.annotManager;
                this.rotationForDoubleClick = this.rotation;
                this.previousRotation = undefined;
                am.redrawAnnotation(this.annotation);
            }
        };

        window.Tools.Tool.prototype.angleMouseDoubleClick = function (addExtraPoint = false) {
            const firstPoint = this.annotation.getPathPoint(this.annotation.getPath().length - 2);
            const secondPoint = this.annotation.getPathPoint(this.annotation.getPath().length - 1);
            this.rotatedPoint = calculator.getRotatedPoint(firstPoint, secondPoint, this.rotation);
            this.annotation.popPath();
            this.annotation.addPathPoint(this.rotatedPoint.x, this.rotatedPoint.y);
            if (addExtraPoint) {
                this.annotation.addPathPoint(this.annotation.getPathPoint(0).x, this.annotation.getPathPoint(0).y);
            }
            const am = window.annotManager;
            am.addAnnotation(this.annotation, false);
            this.annotation = undefined;
            this.rotation = undefined;
        };

        window.Tools.Tool.prototype.checkSnappy = async function (evt) {
            const currenLoc = this.getMouseLocation(evt);
            const displayMode = window.docViewer.getDisplayModeManager().getDisplayMode();
            const pageNumber = window.docViewer.getCurrentPage();
            const pagePoint = displayMode.windowToPage(currenLoc, pageNumber);
            if (!this.annotation && !this.lineAnnot) {
                this.lineAnnot = new window.Annotations.LineAnnotation();
                this.lineAnnot.setStartPoint(pagePoint.x, pagePoint.x);
                this.lineAnnot.setEndPoint(pagePoint.x, pagePoint.x);
                this.lineAnnot.Subject = "SnapOnHelper";
                this.lineAnnot.disableRotationControl();
                window.annotManager.addAnnotation(this.lineAnnot, true);
            } else if (this.annotation && this.lineAnnot) {
                window.annotManager.deleteAnnotation(this.lineAnnot, true, true);
                this.lineAnnot = undefined;
            }

            if (this.lineAnnot) {
                if (this.lineAnnot.PageNumber !== pageNumber) {
                    this.lineAnnot.PageNumber = pageNumber;
                }
                this.lineAnnot.setEndPoint(pagePoint.x, pagePoint.y);
                window.annotManager.redrawAnnotation(this.lineAnnot);
            } else if (this.annotation) {
                this.annotation.snapGuidePoint = pagePoint;
                window.annotManager.redrawAnnotation(this.annotation);
            }
            const snapPoint = await window.docViewer.snapToNearest(pageNumber, pagePoint.x, pagePoint.y, AnnotationStore.getSnapMode(true));
            if (snapPoint) {
                try {
                    if (this.lineAnnot) {
                        this.lineAnnot.setStartPoint(snapPoint.x, snapPoint.y);
                        window.annotManager.redrawAnnotation(this.lineAnnot);
                    } else if (this.annotation) {
                        this.annotation.snapPoint = snapPoint;
                        window.annotManager.redrawAnnotation(this.annotation);
                    }
                } catch (error) {
                    console.log("SnapOn Error: " + error);
                }
            }
        };
    }
}
