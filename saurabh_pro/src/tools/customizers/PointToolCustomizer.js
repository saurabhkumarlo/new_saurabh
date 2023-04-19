import AnnotationStore from "../../stores/AnnotationStore";

export default class PointToolCustomizer {
    constructor() {
        this.PointCreateTool = undefined;
    }

    init(initializer, window) {
        const PointAnnotation = initializer.getPointAnnotation();
        this.PointCreateTool = function (docViewer) {
            window.Tools.GenericAnnotationCreateTool.call(this, docViewer, PointAnnotation);
            this.overrideSelection = true;
        };
        this.PointCreateTool.prototype = new window.Tools.GenericAnnotationCreateTool();
        this.PointCreateTool.prototype.mouseLeftUp = function () {
            if (this.annotation) {
                this.annotation.Width = AnnotationStore.getPointValueInheritance().getPointSize();
                this.annotation.Height = AnnotationStore.getPointValueInheritance().getPointSize();
                this.annotation.iconType = AnnotationStore.getPointValueInheritance().getIconType();
                if (initializer.isSnaponEnabled() && this.lineAnnot) {
                    this.annotation.X = this.lineAnnot.getStartPoint().x - this.annotation.Width / 2;
                    this.annotation.Y = this.lineAnnot.getStartPoint().y - this.annotation.Height / 2;
                } else {
                    this.annotation.X -= this.annotation.Width / 2;
                    this.annotation.Y -= this.annotation.Height / 2;
                }
                this.documentViewer.getAnnotationManager().addAnnotation(this.annotation, false);
                this.annotation = undefined;
            }
        };
        this.PointCreateTool.prototype.mouseMove = function (evt) {
            if (initializer.isSnaponEnabled()) {
                this.checkSnappy(evt);
            }
        };
        this.PointCreateTool.prototype.addEventListener("annotationCreated", function (annotation) {
            annotation.NoResize = true;
            annotation.NoMove = false;
            annotation.FillColor = new window.Annotations.Color(35, 145, 35, 0.8);
            annotation.StrokeColor = new window.Annotations.Color(35, 145, 35, 0.8);
            annotation.iconType = "none";
        });

        const pointCreateSwitchOut = this.PointCreateTool.prototype.switchOut;
        this.PointCreateTool.prototype.switchOut = function () {
            if (this.lineAnnot) {
                try {
                    window.annotManager.deleteAnnotation(this.lineAnnot, true, true);
                    this.lineAnnot = undefined;
                } catch (err) {
                    console.log("Error |  SnapOn (Point): " + err);
                }
            } else {
                if (this.annotation) {
                    this.annotation.snapPoint = undefined;
                    this.annotation.snapGuidePoint = undefined;
                }
            }
            pointCreateSwitchOut.apply(this, arguments);
        };
    }

    getPointCreateTool() {
        return this.PointCreateTool;
    }
}
