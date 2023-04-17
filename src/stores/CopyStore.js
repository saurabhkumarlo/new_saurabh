import { createStore } from "reflux";
import { AnnotationStore, IfcStore } from "./";
import Immutable from "immutable";
import {
    ARROW,
    BORDER_STYLE,
    COLOR,
    ELLIPSE,
    FONT,
    FONT_SIZE,
    FREE_HAND,
    FREE_TEXT,
    GEOMETRA_BORDER_OPACITY,
    GEOMETRA_LINE_END,
    GEOMETRA_LINE_START,
    GEOMETRA_OPACITY,
    HEIGHT,
    ICON_TYPE,
    IFC_MODEL,
    INTERIOR_COLOR,
    POINT,
    POINT_SIZE,
    POLYGON,
    POLYLINE,
    QUANTITY,
    REDUCTION,
    RICH_TEXT_STYLE,
    STAMP,
    STROKE_COLOR,
    STROKE_SIZE,
    TEXT_ALIGN,
    TEXT_ALIGN_SM,
} from "../constants/AnnotationConstants";
import { X_SCALE_NAME, Y_SCALE_NAME } from "../constants/ScaleConstants";
import ObjectsStore from "./ObjectsStore";

export default createStore({
    init() {
        this.propertiesCopy = new Immutable.Map();
        this.stylesCopy = new Immutable.Map();
    },

    getPropertiecCopy() {
        return this.propertiesCopy;
    },

    getStylesCopy() {
        return this.stylesCopy;
    },

    copyAnnotationProperties() {
        const displayAnnot = AnnotationStore.getTheDisplayAnnot();
        this.propertiesCopy = this.propertiesCopy.clear();
        const typeMap = ObjectsStore.getTypeMap();
        if (displayAnnot && typeMap.nrSelected === 1) {
            this.propertiesCopy = this.propertiesCopy.set(HEIGHT, displayAnnot.get(HEIGHT));
            this.propertiesCopy = this.propertiesCopy.set(QUANTITY, displayAnnot.get(QUANTITY));
            if (displayAnnot.has("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X")) {
                this.propertiesCopy = this.propertiesCopy
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"));
            }
            if (displayAnnot.has("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X")) {
                this.propertiesCopy = this.propertiesCopy
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"))
                    .set("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", displayAnnot.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"));
            }
        }
    },

    pasteAnnotationProperties(selectedAnnotations) {
        if (!this.propertiesCopy.isEmpty()) {
            let annotationsToUpdate = new Immutable.List();
            selectedAnnotations.forEach((annot) => {
                if (annot.get("type") === "group") {
                    const children = AnnotationStore.getAllAnnotationsFromParent(annot.get("id")).filter((_annot) => {
                        return _annot.get("type") !== "group";
                    });
                    annotationsToUpdate = annotationsToUpdate.concat(children);
                } else {
                    annotationsToUpdate = annotationsToUpdate.push(annot);
                }
            });
            annotationsToUpdate = annotationsToUpdate.map((annot) => {
                switch (annot.get("type")) {
                    case POLYGON:
                    case ELLIPSE:
                    case FREE_HAND:
                    case REDUCTION:
                        if (this.propertiesCopy.get(HEIGHT)) {
                            annot = annot.set(HEIGHT, this.propertiesCopy.get(HEIGHT));
                        }
                        if (this.propertiesCopy.get(QUANTITY)) {
                            annot = annot.set(QUANTITY, this.propertiesCopy.get(QUANTITY));
                        }
                        if (this.propertiesCopy.has("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X")) {
                            const parser = new DOMParser();
                            const oSerializer = new XMLSerializer();
                            const xfdfElements = parser.parseFromString(annot.get("xfdf"), "text/xml");
                            const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH")
                            );
                            annot = annot.set("xfdf", oSerializer.serializeToString(xfdfElements));
                        }
                        if (this.propertiesCopy.has("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X")) {
                            const parser = new DOMParser();
                            const oSerializer = new XMLSerializer();
                            const xfdfElements = parser.parseFromString(annot.get("xfdf"), "text/xml");
                            const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y")
                            );
                            annotElement.setAttribute(
                                "ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH",
                                this.propertiesCopy.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH")
                            );
                            annot = annot.set("xfdf", oSerializer.serializeToString(xfdfElements));
                        }
                        break;
                    case POLYLINE:
                        if (this.propertiesCopy.get(HEIGHT)) {
                            annot = annot.set(HEIGHT, this.propertiesCopy.get(HEIGHT));
                        }
                        if (this.propertiesCopy.get(QUANTITY)) {
                            annot = annot.set(QUANTITY, this.propertiesCopy.get(QUANTITY));
                        }
                        break;
                    case POINT:
                    case STAMP:
                    case FREE_TEXT:
                        if (this.propertiesCopy.get(QUANTITY)) {
                            annot = annot.set(QUANTITY, this.propertiesCopy.get(QUANTITY));
                        }
                        break;
                    default:
                        break;
                }
                return annot;
            });
            if (annotationsToUpdate.size > 0) {
                AnnotationStore.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },

    copyAnnotationStyles() {
        // const displayAnnot = AnnotationStore.getTheDisplayAnnot();
        // this.stylesCopy = this.stylesCopy.clear();
        // const typeMap = ObjectsStore.getTypeMap();
        // if (displayAnnot && typeMap.nrSelected === 1) {
        //     const isScale = displayAnnot.get("type") === X_SCALE_NAME || displayAnnot.get("type") === Y_SCALE_NAME;
        //     const currentlySelectedNodeXfdf = isScale
        //         ? TreeStore.getCurrentlySelectedNodes().first().toJS().xdf
        //         : TreeStore.getCurrentlySelectedNodes().first().toJS().xfdf;
        //     const borderStyle = AnnotationStore.parseStyleFromXfdf(currentlySelectedNodeXfdf);
        //     const richTextStyle = AnnotationStore.parseRichTextStyleFromXfdf(currentlySelectedNodeXfdf);
        //     const defaultStyle = AnnotationStore.parseDefaultStyleFromXfdf(currentlySelectedNodeXfdf);
        //     const color = displayAnnot.get("type") === IFC_MODEL ? displayAnnot.getIn(["xfdf", COLOR]) : displayAnnot.get(COLOR);
        //     const font = defaultStyle.font;
        //     const textAlign = defaultStyle[TEXT_ALIGN_SM];
        //     this.stylesCopy = this.stylesCopy.set(FONT, font);
        //     this.stylesCopy = this.stylesCopy.set(TEXT_ALIGN, textAlign);
        //     this.stylesCopy = this.stylesCopy.set(BORDER_STYLE, borderStyle);
        //     this.stylesCopy = this.stylesCopy.set(RICH_TEXT_STYLE, richTextStyle);
        //     this.stylesCopy = this.stylesCopy.set(FONT_SIZE, displayAnnot.get(FONT_SIZE));
        //     this.stylesCopy = this.stylesCopy.set(POINT_SIZE, displayAnnot.get(POINT_SIZE));
        //     this.stylesCopy = this.stylesCopy.set(COLOR, color);
        //     this.stylesCopy = this.stylesCopy.set(STROKE_COLOR, displayAnnot.get(STROKE_COLOR));
        //     this.stylesCopy = this.stylesCopy.set(INTERIOR_COLOR, displayAnnot.get(INTERIOR_COLOR));
        //     this.stylesCopy = this.stylesCopy.set(GEOMETRA_OPACITY, displayAnnot.get(GEOMETRA_OPACITY));
        //     this.stylesCopy = this.stylesCopy.set(GEOMETRA_BORDER_OPACITY, displayAnnot.get(GEOMETRA_BORDER_OPACITY));
        //     this.stylesCopy = this.stylesCopy.set(STROKE_SIZE, displayAnnot.get(STROKE_SIZE));
        //     this.stylesCopy = this.stylesCopy.set(GEOMETRA_LINE_START, displayAnnot.get(GEOMETRA_LINE_START));
        //     this.stylesCopy = this.stylesCopy.set(GEOMETRA_LINE_END, displayAnnot.get(GEOMETRA_LINE_END));
        //     this.stylesCopy = this.stylesCopy.set(ICON_TYPE, displayAnnot.get(ICON_TYPE));
        // }
    },

    pasteBorderStyles(annot) {
        const borderStyle = this.stylesCopy.get(BORDER_STYLE);
        const geometraBorderOpacity = this.stylesCopy.get(GEOMETRA_BORDER_OPACITY);
        const strokeSize = this.stylesCopy.get(STROKE_SIZE);

        if (borderStyle) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeStyle(list, borderStyle, true);
            annot = updatedList.first();
        }
        if (geometraBorderOpacity || geometraBorderOpacity === 0) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeGeometraBorderOpacity(list, geometraBorderOpacity, true);
            annot = updatedList.first();
        }

        if (strokeSize && !Number.isNaN(strokeSize)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeStrokeThickness(list, strokeSize, true);
            annot = updatedList.first();
        }

        return annot;
    },

    pasteDefaultStyles(annot) {
        if (this.stylesCopy.get(INTERIOR_COLOR)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeInteriorColor(list, this.stylesCopy.get(INTERIOR_COLOR), true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(COLOR)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeColor(list, this.stylesCopy.get(COLOR), true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(GEOMETRA_OPACITY) || this.stylesCopy.get(GEOMETRA_OPACITY) === 0) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeGeometraOpacity(list, this.stylesCopy.get(GEOMETRA_OPACITY), true);
            annot = updatedList.first();
        }

        return annot;
    },

    async pasteTextStyles(annot) {
        if (this.stylesCopy.get(RICH_TEXT_STYLE)) {
            const list = Immutable.List.of(annot);
            const updatedList = await AnnotationStore.setRichTextStyle(list, this.stylesCopy.get(RICH_TEXT_STYLE), true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(STROKE_COLOR)) {
            const list = Immutable.List.of(annot);
            const updatedList = await AnnotationStore.changeStrokeColor(list, this.stylesCopy.get(STROKE_COLOR), true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(TEXT_ALIGN)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeTextStyle(list, TEXT_ALIGN_SM, `${this.stylesCopy.get(TEXT_ALIGN)}`, true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(FONT)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeTextStyle(list, FONT, `${this.stylesCopy.get(FONT)}`, true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(FONT_SIZE)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeFontSize(list, this.stylesCopy.get(FONT_SIZE), true);
            annot = updatedList.first();
        }

        return annot;
    },

    pasteLineStyles(annot) {
        if (this.stylesCopy.get(GEOMETRA_LINE_START)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeAnnotationAttribute(list, GEOMETRA_LINE_START, this.stylesCopy.get(GEOMETRA_LINE_START), true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(GEOMETRA_LINE_END)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeAnnotationAttribute(list, GEOMETRA_LINE_END, this.stylesCopy.get(GEOMETRA_LINE_END), true);
            annot = updatedList.first();
        }

        return annot;
    },

    pastePointStyles(annot) {
        if (this.stylesCopy.get(POINT_SIZE) && !Number.isNaN(this.stylesCopy.get(POINT_SIZE))) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changePointSize(list, this.stylesCopy.get(POINT_SIZE), true);
            annot = updatedList.first();
        }

        if (this.stylesCopy.get(ICON_TYPE)) {
            const list = Immutable.List.of(annot);
            const updatedList = AnnotationStore.changeIconType(list, this.stylesCopy.get(ICON_TYPE), true);
            annot = updatedList.first();
        }

        return annot;
    },

    async pasteAnnotationStyles(selectedAnnotations) {
        if (!this.stylesCopy.isEmpty()) {
            let annotationsToUpdate = new Immutable.List();
            selectedAnnotations.forEach((annot) => {
                if (annot.get("type") === "group") {
                    const children = AnnotationStore.getAllAnnotationsFromParent(annot.get("id")).filter((_annot) => {
                        return _annot.get("type") !== "group";
                    });
                    annotationsToUpdate = annotationsToUpdate.concat(children);
                } else {
                    annotationsToUpdate = annotationsToUpdate.push(annot);
                }
            });
            const standardAnnots = annotationsToUpdate.filter((annot) => annot.get("type") !== "3DModel");
            const ifcAnnots = annotationsToUpdate.filter((annot) => annot.get("type") === "3DModel");
            if (ifcAnnots.size > 0) {
                IfcStore.changeIfcStyles(COLOR, this.stylesCopy.get(COLOR), ifcAnnots);
            }

            const annotationsToUpdateAsync = standardAnnots.map(async (annot) => {
                switch (annot.get("type")) {
                    case POLYGON:
                    case ELLIPSE:
                    case FREE_HAND:
                    case REDUCTION:
                    case STAMP:
                        annot = this.pasteDefaultStyles(annot);
                        annot = this.pasteBorderStyles(annot);
                        break;
                    case FREE_TEXT:
                        annot = await this.pasteTextStyles(annot);
                        annot = this.pasteDefaultStyles(annot);
                        annot = this.pasteBorderStyles(annot);
                        break;
                    case POLYLINE:
                    case Y_SCALE_NAME:
                    case X_SCALE_NAME:
                    case ARROW:
                        annot = this.pasteDefaultStyles(annot);
                        annot = this.pasteBorderStyles(annot);
                        annot = this.pasteLineStyles(annot);
                        break;
                    case POINT:
                        annot = this.pasteDefaultStyles(annot);
                        annot = this.pastePointStyles(annot);
                        break;
                    default:
                        break;
                }
                return annot;
            });
            const annotationsToUpdatePromises = annotationsToUpdateAsync.toJS();
            const resolveAnnotations = await Promise.all(annotationsToUpdatePromises);

            if (resolveAnnotations.length > 0) {
                AnnotationStore.onRequestAnnotationUpdateArray(resolveAnnotations);
            }
        }
    },
});
