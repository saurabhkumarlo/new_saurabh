import AnnotationCustomizer from "../customizers/AnnotationCustomizer";
import AnnotationEditCustomizer from "../../tools/customizers/AnnotationEditCustomizer";
import AnnotationStore from "../../stores/AnnotationStore";
import ArrowAnnotationCustomizer from "../customizers/ArrowAnnotationCustomizer";
import ArrowToolCustomizer from "../../tools/customizers/ArrowToolCustomizer";
import EllipseCalculator from "../calculators/EllipseCalculator";
import EllipseCustomizer from "../customizers/EllipseCustomizer";
import EllipseToolCustomizer from "../../tools/customizers/EllipseToolCustomizer";
import FreeHandCustomizer from "../customizers/FreeHandCustomizer";
import FreeHandToolCustomizer from "../../tools/customizers/FreeHandToolCustomizer";
import FreeTextCustomizer from "../customizers/FreeTextCustomizer";
import FreeTextToolCustomizer from "../../tools/customizers/FreeTextToolCustomizer";
import PointCustomizer from "../customizers/PointCustomizer";
import PointToolCustomizer from "../../tools/customizers/PointToolCustomizer";
import PolygonCustomizer from "../customizers/PolygonCustomizer";
import PolygonToolCustomizer from "../../tools/customizers/PolygonToolCustomizer";
import PolylineCustomizer from "../customizers/PolylineCustomizer";
import PolylineToolCustomizer from "../../tools/customizers/PolylineToolCustomizer";
import PrintHelper from "../PrintHelper";
import StampCustomizer from "../customizers/StampCustomizer";
import ToolCustomizer from "../../tools/customizers/ToolCustomizer";

class BasicInitializer {
    constructor(webviewer) {
        this.webviewer = webviewer;
        this.initAnnotation = new AnnotationCustomizer();
        this.initPointAnnotation = new PointCustomizer();
        this.initPolygonAnnotation = new PolygonCustomizer();
        this.initEllipseAnnotation = new EllipseCustomizer();
        this.initFreeHandAnnotation = new FreeHandCustomizer();
        this.initPolylineAnnotation = new PolylineCustomizer();
        this.initFreeTextAnnotation = new FreeTextCustomizer();
        this.initStampAnnotation = new StampCustomizer();
        this.calculator = new EllipseCalculator();
        this.initAnnotationEdit = new AnnotationEditCustomizer();
        this.initEllipseTool = new EllipseToolCustomizer();
        this.initFreeHandTool = new FreeHandToolCustomizer();
        this.initPointTool = new PointToolCustomizer();
        this.initPolygonTool = new PolygonToolCustomizer();
        this.initPolylineTool = new PolylineToolCustomizer();
        this.initTool = new ToolCustomizer();
        this.drawing = false;
        this.printHelper = new PrintHelper();
        this.freeTextToolCustomizer = new FreeTextToolCustomizer();
        this.initArrowTool = new ArrowToolCustomizer();
        this.arrowAnnotationCustomizer = new ArrowAnnotationCustomizer();
    }

    isSnaponEnabled() {
        return AnnotationStore.isSnaponEnabled();
    }

    isDrawing() {
        return this.drawing;
    }

    setIsDrawing(drawing) {
        this.drawing = drawing;
    }

    getPointAnnotation() {
        return this.initPointAnnotation.getPointAnnotation();
    }

    getPrintHelper() {
        return this.printHelper;
    }

    cleanup() {
        this.webviewer = undefined;
        this.initAnnotation = undefined;
        this.initPointAnnotation = undefined;
        this.initPolygonAnnotation = undefined;
        this.initEllipseAnnotation = undefined;
        this.initFreeHandAnnotation = undefined;
        this.initPolylineAnnotation = undefined;
        this.initFreeTextAnnotation = undefined;
        this.initStampAnnotation = undefined;
        this.calculator = undefined;
        this.initAnnotationEdit = undefined;
        this.initEllipseTool = undefined;
        this.initFreeHandTool = undefined;
        this.initPointTool = undefined;
        this.initPolygonTool = undefined;
        this.initPolylineTool = undefined;
        this.initTool = undefined;
        this.drawing = false;
        this.printHelper = undefined;
    }
}

export default BasicInitializer;
