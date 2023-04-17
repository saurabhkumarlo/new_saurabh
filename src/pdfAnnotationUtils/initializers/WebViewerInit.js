import BasicInitializer from "./BasicInitializer";

class WebviewerInit extends BasicInitializer {
    init() {
        try {
            const Annotations = this.webviewer.Annotations;

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

            this.initAnnotationEdit.init(this.webviewer, this.calculator);
            this.initEllipseTool.init(this, this.webviewer, this.calculator);
            this.initFreeHandTool.init(this, this.webviewer);
            this.initPointTool.init(this, this.webviewer);
            this.initPolygonTool.init(this, this.webviewer, this.calculator);
            this.initPolylineTool.init(this, this.webviewer, this.calculator);
            this.initTool.init(this.webviewer, this.calculator);
            this.printHelper.init(this.webviewer, this.calculator);
            this.freeTextToolCustomizer.init(this, this.webviewer);
            this.initArrowTool.init(this.webviewer);

            const am = this.webviewer.annotManager; //readerControl.docViewer.getAnnotationManager();

            const scaleTool = "AnnotationCreateScale";
            const ScaleCreateTool = this.initPolylineTool.getScaleCreateTool();
            const scaleCreateTool = new ScaleCreateTool(this.webviewer.docViewer);

            this.webviewer.registerTool({
                toolName: scaleTool,
                toolObject: scaleCreateTool,
            });
            am.registerAnnotationType(Annotations.PolylineAnnotation.prototype.elementName, Annotations.PolylineAnnotation);

            // Point
            const pointTool = "AnnotationCreatePoint";
            const PointCreateTool = this.initPointTool.getPointCreateTool();
            const pointCreateTool = new PointCreateTool(this.webviewer.docViewer);
            this.webviewer.registerTool({
                toolName: pointTool,
                toolObject: pointCreateTool,
            });
            const PointAnnotation = this.initPointAnnotation.getPointAnnotation();
            am.registerAnnotationType("point", PointAnnotation);

            // Reduction
            const reductionTool = "AnnotationCreateReduction";
            const ReductionCreateTool = this.initPolygonTool.getReductionCreateTool();
            const reductionCreateTool = new ReductionCreateTool(this.webviewer.docViewer);
            this.webviewer.registerTool({
                toolName: reductionTool,
                toolObject: reductionCreateTool,
            });

            // Listening for scale changes
            am.addEventListener("annotationChanged", (annotations, action) => {
                for (let i = 0; i < annotations.length; i++) {
                    switch (action) {
                        case "add":
                        case "modify":
                            if (annotations[i].Subject === "x-scale" || annotations[i].Subject === "y-scale") {
                                this.calculator.setScale(annotations[i].getPageNumber(), annotations[i]);
                            }
                            break;
                        case "delete":
                            if (annotations[i].Subject === "x-scale" || annotations[i].Subject === "y-scale") {
                                this.calculator.deleteScale(annotations[i].getPageNumber(), annotations[i]);
                            }
                            break;
                        default:
                            break;
                    }
                }
            });
            // Setting ddefault colours for the drawing tools
            const toolModeMap = this.webviewer.docViewer.getToolModeMap();

            for (let toolName in toolModeMap) {
                if (toolModeMap.hasOwnProperty(toolName) && toolModeMap[toolName].defaults) {
                    //toolModeMap[toolName].cursor = 'crosshair';//'sw-resize';
                    if (toolModeMap[toolName].enableCreationOverAnnotation) toolModeMap[toolName].enableCreationOverAnnotation();

                    switch (toolName) {
                        case "AnnotationCreateScale":
                            toolModeMap[toolName].defaults.FillColor = new Annotations.Color(204, 0, 0, 0.85);
                            toolModeMap[toolName].defaults.StrokeColor = new Annotations.Color(204, 0, 0, 0.85);
                            break;
                        case "AnnotationCreateReduction":
                            toolModeMap[toolName].defaults.FillColor = new Annotations.Color(128, 128, 128, 0.8);
                            toolModeMap[toolName].defaults.StrokeColor = new Annotations.Color(128, 128, 128, 0.8);
                            break;
                        case "AnnotationCreateFreeText":
                            toolModeMap[toolName].initialText = "";
                            break;
                        default:
                            toolModeMap[toolName].defaults.FillColor = new Annotations.Color(35, 145, 35, 0.8);
                            toolModeMap[toolName].defaults.StrokeColor = new Annotations.Color(35, 145, 35, 0.8);
                    }
                }
            }
        } catch (error) {
            console.log("error in WebViewerInit: " + error.stack);
        }
    }
}

export default WebviewerInit;
