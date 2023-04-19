import AnnotationStore from "../stores/AnnotationStore";
import AuthenticationStore from "../stores/AuthenticationStore";
import DisplayValuesHolder from "./DisplayValuesHolder";
import GeometricCalculation from "../utils/GeometricCalculation";
import Immutable from "immutable";
import PdfDisplayValueFactory from "./PdfDisplayValueFactory";
import { getInstance } from "@pdftron/webviewer";
import { DISPLAY_VALUES_OPTIONS } from "../constants/FeatureConstants";

class DisplayValuesAnnotationsHandler {
    constructor() {
        this.displayValueAnnotations = {};
    }

    static getInstance() {
        if (!DisplayValuesAnnotationsHandler.instance) {
            DisplayValuesAnnotationsHandler.instance = new DisplayValuesAnnotationsHandler();
        }
        return DisplayValuesAnnotationsHandler.instance;
    }

    getDisplayValueAnnotations(id) {
        return this.displayValueAnnotations[id];
    }

    setDisplayValueAnnotations(id, displayValuesHolder) {
        this.displayValueAnnotations[id] = displayValuesHolder;
    }

    addDisplayAnnotations(parentId, displayAnnotation) {
        let displayType;
        let webviewerDisplay = false;
        if (displayAnnotation.Id) {
            webviewerDisplay = true;
            displayType = displayAnnotation.Subject;
        } else {
            displayType = displayAnnotation.get("type");
        }
        let displayValuesHolder = this.getDisplayValueAnnotations(parentId);
        if (!displayValuesHolder) {
            displayValuesHolder = new DisplayValuesHolder(parentId);
        }

        if (displayType === "CenterValue") {
            if (webviewerDisplay) {
                displayValuesHolder.setCenterAnnotationPdf(displayAnnotation);
            } else {
                try {
                    displayValuesHolder.setCenterAnnotation(displayAnnotation);
                    this.setDisplayValueAnnotations(parentId, displayValuesHolder);
                } catch (error) {
                    console.log("error " + error.stack);
                }
            }
        } else {
            if (webviewerDisplay) {
                let peripherals = displayValuesHolder.getPeripheralAnnotationsPdf();
                if (!peripherals) {
                    peripherals = new Immutable.List();
                }
                if (
                    peripherals.find((annot) => {
                        let retval = annot.Id === displayAnnotation.Id;
                        return retval;
                    })
                ) {
                    peripherals = peripherals.map((annot) => {
                        if (annot.Id === displayAnnotation.Id) {
                            return displayAnnotation;
                        }
                        return annot;
                    });
                } else {
                    peripherals = peripherals.push(displayAnnotation);
                }
                displayValuesHolder.setPeripheralAnnotationsPdf(peripherals);
                this.setDisplayValueAnnotations(parentId, displayValuesHolder);
            } else {
                let peripherals = displayValuesHolder.getPeripheralAnnotations();
                if (!peripherals) {
                    peripherals = new Immutable.List();
                }
                if (peripherals.find((annot) => annot.get("id") === displayAnnotation.get("id"))) {
                    peripherals = peripherals.map((annot) => {
                        if (annot.get("id") === displayAnnotation.get("id")) {
                            return displayAnnotation;
                        }
                        return annot;
                    });
                } else {
                    peripherals = peripherals.push(displayAnnotation);
                }
                displayValuesHolder.setPeripheralAnnotations(peripherals);
                this.setDisplayValueAnnotations(parentId, displayValuesHolder);
            }
        }
    }

    removeDisplayAnnotations(parentId, displayAnnotation) {
        const displayValuesHolder = this.getDisplayValueAnnotations(parentId);
        if (displayValuesHolder && displayValuesHolder.remove(displayAnnotation)) {
            this.setDisplayValueAnnotations(parentId, undefined);
        }
    }

    async getDisplayAnnotationsByAnnotationType(parentAnnotation, displayType) {
        switch (parentAnnotation.get("type")) {
            case "Polygon":
            case "Reduction":
                if (displayType === "center") {
                    return await this.getCenterDisplayAnnotationXFDF(parentAnnotation);
                } else if (displayType === "peripheral") {
                    return await this.getPeripheralDisplayAnnotationsXFDFS(parentAnnotation);
                }
                break;
            case "Point":
                return await this.getCenterDisplayAnnotationXFDF(parentAnnotation);
            case "annotation.freeHand":
            case "Free Hand":
            case "Free hand":
                return await this.getCenterDisplayAnnotationXFDF(parentAnnotation);
            case "Ellipse":
                return await this.getCenterDisplayAnnotationXFDF(parentAnnotation);
            case "Polyline":
                return await this.getPeripheralDisplayAnnotationsXFDFS(parentAnnotation);
            case "x-scale":
            case "y-scale":
                return await this.getCenterDisplayAnnotationXFDF(parentAnnotation);
            case "Free text":
            case "Stamp":
            case "Arrow":
                return [];
            default:
                return [];
        }
    }

    updateAnnotation(annotation, diplsayValuList) {
        const type = annotation.get("type");
        const availableDisplkayValues = PdfDisplayValueFactory.getInstance().getValueStateBygType(type);
        const displayListForAnnotation = diplsayValuList.filter((value) => availableDisplkayValues.includes(value));
        const parser = new DOMParser();
        const oSerializer = new XMLSerializer();
        const xfdf = annotation.get("xfdf") || annotation.get("xdf");
        if (xfdf) {
            const displayValueTypes = PdfDisplayValueFactory.getInstance().getDisplayValuesByTypeAndPlacement(type);
            let displayListString = "";
            let activeCenter = false;
            let activePeripheral = false;
            for (let i = 0; i < displayListForAnnotation.size; i++) {
                if (!activeCenter && displayValueTypes.centerValues.includes(displayListForAnnotation.get(i))) {
                    activeCenter = true;
                }
                if (!activePeripheral && displayValueTypes.peripheralValues.includes(displayListForAnnotation.get(i))) {
                    activePeripheral = true;
                }
                if (i === displayListForAnnotation.length - 1) {
                    displayListString += displayListForAnnotation.get(i);
                } else {
                    displayListString += displayListForAnnotation.get(i) + ",";
                }
            }
            const xfdfElements = parser.parseFromString(xfdf, "text/xml");
            const annotElement = xfdfElements.querySelector("annots").firstElementChild;
            annotElement.setAttribute("gDisplayValues", displayListString);
            const newXFDF = oSerializer.serializeToString(xfdfElements);
            return { data: newXFDF, displayValueList: displayListForAnnotation, activeCenter, activePeripheral };
        }
        return undefined;
    }

    async getCenterDisplayAnnotationXFDF(parentAnnotation) {
        const webviewer = getInstance(AnnotationStore.getElement());
        if (webviewer) {
            const calc = new GeometricCalculation();
            let centerX;
            let centerY;
            const centerPoint = calc.getCenterPoint(parentAnnotation);
            const temp = webviewer.docViewer
                .getDocument()
                .getViewerCoordinates(parentAnnotation.get("pageNumber") || parentAnnotation.get("page"), centerPoint[0], centerPoint[1]);

            centerX = temp.x;
            centerY = temp.y;
            const Annotations = webviewer.Annotations;
            const vertices = calc.getVerticesFromXfdf(parentAnnotation.get("xfdf") || parentAnnotation.get("xdf"));
            const dimX = calc.calculateOuterDimX(vertices);
            const dimY = calc.calculateOuterDimY(vertices);
            const width = dimY / 2 > 200 ? 200 : dimY / 2 < 60 ? 60 : dimY / 2;
            const height = dimX / 2 > 200 ? 200 : dimX / 2 < 60 ? 60 : dimX / 2;

            const freeText = new Annotations.FreeTextAnnotation();
            freeText.PageNumber = parentAnnotation.get("pageNumber") || parentAnnotation.get("page");
            freeText.Subject = "CenterValue";
            freeText.Width = width;
            freeText.Height = height;
            freeText.X = centerX;
            freeText.Y = centerY - height / 2;
            freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
            freeText.setContents("No values yet");
            freeText.FillColor = new Annotations.Color(0, 0, 0, 0);
            freeText.FontSize = "0";
            freeText.TextAlign = "left";
            freeText.EXPORT_CALCULATED_FONT_SIZE = true;
            freeText.Author = AuthenticationStore.getUserId();
            const xfdf = await webviewer.annotManager.exportAnnotations({ annotList: [freeText] });
            const parser = new DOMParser();
            const xfdfElements = parser.parseFromString(xfdf, "text/xml");
            const annotElement = xfdfElements.querySelector("annots").firstElementChild;
            return Immutable.fromJS({
                annotXfdf: xfdf,
                type: annotElement.getAttribute("subject"),
                fileId: AnnotationStore.getActiveFileId(),
                annotationId: annotElement.getAttribute("name"),
                parentId: parentAnnotation.get("annotationId"),
            });
        }
        return undefined;
    }

    getXY({ point2, dx, dy, width, height }) {
        const pageRotation = AnnotationStore.getPageRotation();
        switch (pageRotation) {
            case 0:
                return { x: point2[0] + dx / 2, y: point2[1] + dy / 2 };
            case 1:
                return { x: point2[0] + dx / 2, y: point2[1] + dy / 2 - height };
            case 2:
                return { x: point2[0] + dx / 2 - width, y: point2[1] + dy / 2 - height };
            case 3:
                return { x: point2[0] + dx / 2 - width, y: point2[1] + dy / 2 };
            default:
                return { x: point2[0] + dx / 2, y: point2[1] + dy / 2 };
        }
    }

    async getPeripheralDisplayAnnotationsXFDFS(parentAnnotation) {
        let displayAnnotationsToReturn = new Immutable.List();
        const webviewer = getInstance(AnnotationStore.getElement());
        if (webviewer) {
            const calc = new GeometricCalculation();
            const path = calc.getVerticesFromXfdf(parentAnnotation.get("xfdf"));
            for (let i = 0; i < path.length - 1; i++) {
                let point1;
                let point2;
                if (parentAnnotation.Id) {
                    point1 = path[i];
                    point2 = path[i + 1];
                } else {
                    const temp1 = webviewer.docViewer.getDocument().getViewerCoordinates(parentAnnotation.get("pageNumber"), path[i][0], path[i][1]);
                    const temp2 = webviewer.docViewer.getDocument().getViewerCoordinates(parentAnnotation.get("pageNumber"), path[i + 1][0], path[i + 1][1]);
                    point1 = [temp1.x, temp1.y];
                    point2 = [temp2.x, temp2.y];
                }
                const Annotations = webviewer.Annotations;
                const freeText = new Annotations.FreeTextAnnotation();
                const vertices = calc.getVerticesFromXfdf(parentAnnotation.get("xfdf"));
                const dimX = calc.calculateOuterDimX(vertices) / 4;
                const dimY = calc.calculateOuterDimY(vertices) / 4;
                const width = dimY > 80 ? 80 : dimY < 35 ? 35 : dimY;
                const height = dimX > 40 ? 40 : dimX < 20 ? 20 : dimX;
                const dx = point1[0] - point2[0];
                const dy = point1[1] - point2[1];
                const { x, y } = this.getXY({ point2, dx, dy, width, height });
                freeText.PageNumber = parentAnnotation.get("pageNumber");
                freeText.Subject = "PeripheralValue";
                freeText.Width = width;
                freeText.Height = height;
                freeText.X = x;
                freeText.Y = y;
                freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
                freeText.setContents("No values yet");
                freeText.FillColor = new Annotations.Color(0, 0, 0, 0);
                freeText.FontSize = "0";
                freeText.EXPORT_CALCULATED_FONT_SIZE = true;
                freeText.index = i;
                freeText.Author = AuthenticationStore.getUserId();
                const xfdf = await webviewer.annotManager.exportAnnotations({ annotList: [freeText] });
                const parser = new DOMParser();
                const xfdfElements = parser.parseFromString(xfdf, "text/xml");
                const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                const annotation = Immutable.fromJS({
                    annotXfdf: xfdf,
                    type: annotElement.getAttribute("subject"),
                    fileId: AnnotationStore.getActiveFileId(),
                    annotationId: annotElement.getAttribute("name"),
                    parentId: parentAnnotation.get("annotationId"),
                });
                displayAnnotationsToReturn = displayAnnotationsToReturn.push(annotation);
            }
        }
        return displayAnnotationsToReturn;
    }
}

export default DisplayValuesAnnotationsHandler;
