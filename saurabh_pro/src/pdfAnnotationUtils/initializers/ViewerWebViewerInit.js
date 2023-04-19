import BasicInitializer from "./BasicInitializer";

class ViewerWebViewerInit extends BasicInitializer {
    init() {
        try {
            this.calculator.setWindow(this.webviewer);
            this.initAnnotation.init(this.webviewer);
            this.initPointAnnotation.init(this.webviewer, this.calculator);
            this.initPolygonAnnotation.init(this, this.webviewer, this.calculator);
            this.initEllipseAnnotation.init(this.webviewer, this.calculator);
            this.initFreeHandAnnotation.init(this, this.webviewer, this.calculator);
            this.initPolylineAnnotation.init(this, this.webviewer, this.calculator);
            this.initFreeTextAnnotation.init(this.webviewer);
            this.initStampAnnotation.init(this.webviewer);
            this.arrowAnnotationCustomizer.init(this.webviewer, this.calculator);
            this.freeTextToolCustomizer.init(this, this.webviewer);
            this.initArrowTool.init(this.webviewer);

            const am = this.webviewer.annotManager;
            const PointAnnotation = this.initPointAnnotation.getPointAnnotation();
            am.registerAnnotationType("point", PointAnnotation);

            am.addEventListener("annotationChanged", (annotations, action) => {
                for (let i = 0; i < annotations.length; i++) {
                    if (annotations[i].Subject === "x-scale" || annotations[i].Subject === "y-scale") {
                        switch (action) {
                            case "add":
                            case "modify":
                                this.calculator.setScale(annotations[i].getPageNumber(), annotations[i]);
                                break;
                            case "delete":
                                this.calculator.deleteScale(annotations[i].getPageNumber(), annotations[i]);
                                break;
                            default:
                                break;
                        }
                    }
                }
            });
        } catch (error) {
            console.log("error in ViewerWebViewerInit: " + error.stack);
        }
    }
}

export default ViewerWebViewerInit;
