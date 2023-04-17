import { LABELS, RENDER_TYPES } from "constants/LabelsConstants";
import AnnotationStore from "../../stores/AnnotationStore";
import PolylineCalculator from "./PolylineCalculator";
import { FREE_HAND, FREE_HAND2, FREE_HAND3 } from "constants/AnnotationConstants";
import GeometricCalculation from "utils/GeometricCalculation";
import Immutable from "immutable";

export default class PolygonCalculator extends PolylineCalculator {
    buildOrDrawPolygonData(annotation, ctx, rotation) {
        const newAnnotation = annotation.newAnnotation;
        const isFreeHand = annotation.Subject === FREE_HAND || annotation.Subject === FREE_HAND2 || annotation.Subject === FREE_HAND3;
        const isScale = this.getScale(annotation.PageNumber);
        const labels = annotation.labels;
        const activeLabels = labels?.active;
        const styles = labels?.centralStyles;
        const isAnnotSelected =
            AnnotationStore.getSelectedAnnotationIds().size === 1 && AnnotationStore.getSelectedAnnotationIds().first().get("annotationId") === annotation.Id;

        let vertices = undefined;
        if (isFreeHand && annotation.getPath(0)) vertices = annotation.getPath(0);
        else if (annotation.getPath()) vertices = annotation.getPath();

        if (isAnnotSelected) this.buildOrDrawPolylineData(annotation, ctx, rotation, true);

        if (vertices && newAnnotation && isScale) {
            if (vertices) this.drawNewAnnotationLength(vertices, ctx, rotation, annotation.getPageNumber(), true);
        } else {
            if (vertices && activeLabels?.length > 0) {
                const centerTextToShow = this.getPolygonLabels(annotation, vertices, activeLabels);

                if (
                    !isAnnotSelected &&
                    (activeLabels.includes(LABELS.VARIABLES) || activeLabels.includes(LABELS.LENGTHS) || activeLabels.includes(LABELS.WALLS))
                )
                    this.buildOrDrawPolylineData(annotation, ctx, rotation);

                if (centerTextToShow.length) this.drawCentralLabels(ctx, centerTextToShow, styles, annotation, rotation);
            }
        }
    }

    getPolygonLabels(annotation, vertices, activeLabels) {
        const centerTextToShow = [];
        const isScale = this.getScale(annotation.PageNumber);

        const annotVertices = annotation.vertices;
        const scaleData = AnnotationStore.getScaleForPDFAnnotation(annotation);

        let calculator;
        if (scaleData && scaleData.get("x-scale")) {
            calculator = new GeometricCalculation(
                annotation.annotationHeight,
                annotation.annotationQuantity,
                scaleData.get("x-scale"),
                annotation.geoFileId,
                scaleData.get("y-scale")
            );
        }

        if (activeLabels.includes(LABELS.NR_TAG)) centerTextToShow.push("[" + annotation.annotationNumber + "]");
        if (activeLabels.includes(LABELS.NAME)) centerTextToShow.push(annotation.annotationName);

        if (activeLabels.includes(LABELS.VARIABLES)) {
            if (activeLabels.includes(LABELS.AREA) && isScale)
                centerTextToShow.push("A: " + this.getValueToDisplay(this.calculatePolygonArea(vertices, annotation.getPageNumber()), "m2"));
            else centerTextToShow.push("A");

            if (activeLabels.includes(LABELS.LENGTH) && isScale)
                centerTextToShow.push("L: " + this.getValueToDisplay(this.calculatePolylineLineLength(annotation, annotation.PageNumber), "m"));
            else centerTextToShow.push("L");

            if (activeLabels.includes(LABELS.VOLUME) && isScale)
                centerTextToShow.push(
                    "(VO: " + this.getValueToDisplay(this.calculatePolygonArea(vertices, annotation.getPageNumber()) * annotation.annotationHeight, "m3") + ")"
                );
            else centerTextToShow.push("(VO)");

            if (activeLabels.includes(LABELS.WALL) && isScale)
                centerTextToShow.push(
                    "V: " + this.getValueToDisplay(this.calculatePolylineLineLength(annotation, annotation.PageNumber) * annotation.annotationHeight, "m2")
                );
            else centerTextToShow.push("V");

            if (activeLabels.includes(LABELS.NET_AREA) && isScale)
                centerTextToShow.push("NA: " + this.getValueToDisplay(this.calculatePolygonNetArea(annotation), "m2"));
            else centerTextToShow.push("NA");

            if (activeLabels.includes(LABELS.NET_LENGTH) && isScale)
                centerTextToShow.push("NL: " + this.getValueToDisplay(this.calculatePolylineNetLineLength(annotation, annotation.PageNumber), "m"));
            else centerTextToShow.push("NL");

            if (activeLabels.includes(LABELS.NET_VOLUME) && isScale)
                centerTextToShow.push("(NVO: " + this.getValueToDisplay(this.calculatePolygonNetVolume(annotation), "m3") + ")");
            else centerTextToShow.push("(NVO)");

            if (activeLabels.includes(LABELS.NET_WALL) && isScale)
                centerTextToShow.push("NV: " + this.getValueToDisplay(this.calculatePolylineNetWall(annotation, annotation.PageNumber), "m2"));
            else centerTextToShow.push("NV");

            if (activeLabels.includes(LABELS.OUTER_DIM_X) && calculator)
                centerTextToShow.push("DX: " + this.getValueToDisplay(calculator.calculateOuterDimX(annotVertices), "m"));
            else centerTextToShow.push("DX");

            if (activeLabels.includes(LABELS.OUTER_DIM_Y) && calculator)
                centerTextToShow.push("DY: " + this.getValueToDisplay(calculator.calculateOuterDimY(annotVertices), "m"));
            else centerTextToShow.push("DY");

            if ([LABELS.RED_AREA, LABELS.RED_LENGTH, LABELS.RED_VOLUME, LABELS.RED_WALL].some((redLabel) => activeLabels.includes(redLabel))) {
                const reductionData = this.calculateReductionValues(annotation);
                if (activeLabels.includes(LABELS.RED_AREA)) centerTextToShow.push("RA: " + this.getValueToDisplay(reductionData.area, "m2"));
                else centerTextToShow.push("RA");
                if (activeLabels.includes(LABELS.RED_LENGTH)) centerTextToShow.push("RL: " + this.getValueToDisplay(reductionData.length, "m"));
                else centerTextToShow.push("RL");
                if (activeLabels.includes(LABELS.RED_VOLUME)) centerTextToShow.push("RVO: " + this.getValueToDisplay(reductionData.volume, "m3"));
                else centerTextToShow.push("RVO");
                if (activeLabels.includes(LABELS.RED_WALL)) centerTextToShow.push("RV: " + this.getValueToDisplay(reductionData.wall, "m2"));
                else centerTextToShow.push("RV");
            }
        } else if (isScale) {
            if (activeLabels.includes(LABELS.AREA))
                centerTextToShow.push("" + this.getValueToDisplay(this.calculatePolygonArea(vertices, annotation.getPageNumber()), "m2"));

            if (activeLabels.includes(LABELS.LENGTH))
                centerTextToShow.push(this.getValueToDisplay(this.calculatePolylineLineLength(annotation, annotation.PageNumber), "m"));

            if (activeLabels.includes(LABELS.VOLUME))
                centerTextToShow.push(
                    "(" + this.getValueToDisplay(this.calculatePolygonArea(vertices, annotation.PageNumber) * annotation.annotationHeight, "m3") + ")"
                );

            if (activeLabels.includes(LABELS.WALL))
                centerTextToShow.push(
                    this.getValueToDisplay(this.calculatePolylineLineLength(annotation, annotation.PageNumber) * annotation.annotationHeight, "m2")
                );

            if (activeLabels.includes(LABELS.NET_AREA)) centerTextToShow.push("" + this.getValueToDisplay(this.calculatePolygonNetArea(annotation), "m2"));

            if (activeLabels.includes(LABELS.NET_LENGTH))
                centerTextToShow.push(this.getValueToDisplay(this.calculatePolylineNetLineLength(annotation, annotation.PageNumber), "m"));

            if (activeLabels.includes(LABELS.NET_VOLUME))
                centerTextToShow.push("(" + this.getValueToDisplay(this.calculatePolygonNetVolume(annotation), "m3") + ")");

            if (activeLabels.includes(LABELS.NET_WALL))
                centerTextToShow.push(this.getValueToDisplay(this.calculatePolylineNetWall(annotation, annotation.PageNumber), "m2"));

            if (activeLabels.includes(LABELS.OUTER_DIM_X) && calculator)
                centerTextToShow.push(this.getValueToDisplay(calculator.calculateOuterDimX(annotVertices), "m"));

            if (activeLabels.includes(LABELS.OUTER_DIM_Y) && calculator)
                centerTextToShow.push(this.getValueToDisplay(calculator.calculateOuterDimY(annotVertices), "m"));

            if ([LABELS.RED_AREA, LABELS.RED_LENGTH, LABELS.RED_VOLUME, LABELS.RED_WALL].some((redLabel) => activeLabels.includes(redLabel))) {
                const reductionData = this.calculateReductionValues(annotation);
                if (activeLabels.includes(LABELS.RED_AREA)) centerTextToShow.push(this.getValueToDisplay(reductionData.area, "m2"));
                if (activeLabels.includes(LABELS.RED_LENGTH)) centerTextToShow.push(this.getValueToDisplay(reductionData.length, "m"));
                if (activeLabels.includes(LABELS.RED_VOLUME)) centerTextToShow.push(this.getValueToDisplay(reductionData.volume, "m3"));
                if (activeLabels.includes(LABELS.RED_WALL)) centerTextToShow.push(this.getValueToDisplay(reductionData.wall, "m2"));
            }
        }
        return centerTextToShow;
    }

    compensateSqaure(annotation) {
        const firstPoint = annotation.getPathPoint(0);
        const secondPoint = annotation.getPathPoint(1);

        const dx = firstPoint.x - secondPoint.x;
        const dy = firstPoint.y - secondPoint.y;

        if (dx < 0 && dy > 0) {
            // 1
            if (Math.abs(dx) > Math.abs(dy)) {
                secondPoint.y = firstPoint.y - Math.abs(dx);
            } else {
                secondPoint.x = firstPoint.x + Math.abs(dy);
            }
        } else if (dx > 0 && dy > 0) {
            //2
            if (Math.abs(dx) > Math.abs(dy)) {
                secondPoint.y = firstPoint.y - Math.abs(dx);
            } else {
                secondPoint.x = firstPoint.x - Math.abs(dy);
            }
        } else if (dx > 0 && dy < 0) {
            // 3
            if (Math.abs(dx) > Math.abs(dy)) {
                secondPoint.y = firstPoint.y + Math.abs(dx);
            } else {
                secondPoint.x = firstPoint.x - Math.abs(dy);
            }
        } else if (dx < 0 && dy < 0) {
            // 4
            if (Math.abs(dx) > Math.abs(dy)) {
                secondPoint.y = firstPoint.y + Math.abs(dx);
            } else {
                secondPoint.x = firstPoint.x + Math.abs(dy);
            }
        }
    }

    calculatePolygonNetArea(annotation) {
        switch (annotation.Subject) {
            case "Polygon":
            case "Reduction":
            case "Free hand":
            case "Free Hand":
            case "annotation.freeHand": {
                let netArea = undefined;
                if (annotation.formulaNA) {
                    netArea = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNA, "ESTIMATE.ANNOTATION_VALUES.NET_AREA");
                    return netArea;
                }
                if (annotation.Subject === "annotation.freeHand" || annotation.Subject === "Free Hand" || annotation.Subject === "Free hand") {
                    netArea = this.calculatePolygonArea(annotation.getPath(0), annotation.PageNumber);
                } else {
                    netArea = this.calculatePolygonArea(annotation.getPath(), annotation.PageNumber);
                }
                if (annotation.Subject === "Polygon") {
                    const reductions = AnnotationStore.getReductionByParentAnnotationId(annotation.Id);
                    reductions.forEach((storeReduction) => {
                        netArea -=
                            this.calculatePolygonAreaReduction(this.getVerticesFromXfdf(storeReduction.get("xfdf")), storeReduction.get("pageNumber")) *
                            storeReduction.get("quantity");
                    });
                }
                return netArea;
            }
            default:
                break;
        }
    }

    calculatePolygonNetVolume(annotation) {
        switch (annotation.Subject) {
            case "Polygon":
            case "Reduction":
            case "Free hand":
            case "Free Hand":
            case "annotation.freeHand": {
                let netVolume = undefined;
                if (annotation.formulaNVO) {
                    netVolume = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNVO, "ESTIMATE.ANNOTATION_VALUES.VOLUME");
                    return netVolume;
                }
                if (annotation.Subject === "annotation.freeHand" || annotation.Subject === "Free Hand" || annotation.Subject === "Free hand") {
                    netVolume = this.calculatePolygonArea(annotation.getPath(0), annotation.PageNumber) * annotation.annotationHeight;
                } else {
                    netVolume = this.calculatePolygonArea(annotation.getPath(), annotation.PageNumber) * annotation.annotationHeight;
                }
                if (annotation.Subject === "Polygon") {
                    const reductions = AnnotationStore.getReductionByParentAnnotationId(annotation.Id);
                    reductions.forEach((storeReduction) => {
                        netVolume -=
                            this.calculatePolygonAreaReduction(this.getVerticesFromXfdf(storeReduction.get("xfdf")), storeReduction.get("pageNumber")) *
                            storeReduction.get("height") *
                            storeReduction.get("quantity");
                    });
                }
                return netVolume;
            }
            default:
                break;
        }
    }

    crossProduct2d(a, b) {
        return a.x * b.y - a.y * b.x;
    }

    // Polygon
    calculatePolygonArea(vertices, pageNumber) {
        let sum = 0.0;
        try {
            if (vertices && vertices.length < 3) {
                return -1;
            }
            for (let i = 0; i < vertices.length - 1; i++) {
                sum += this.crossProduct2d(vertices[i], vertices[(i + 1) % (vertices.length - 1)]);
            }
        } catch (error) {
            console.log("Error in calculate polygon area: " + error);
        }
        const scaleValue = this.getScaleValue(pageNumber);
        return Math.abs(sum * 0.5) * scaleValue.xScaleValue * scaleValue.yScaleValue;
    }

    crossProduct2dReduction(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    // Polygon
    calculatePolygonAreaReduction(vertices, pageNumber) {
        let sum = 0.0;
        try {
            if (vertices && vertices.length < 3) {
                return -1;
            }
            for (let i = 0; i < vertices.length - 1; i++) {
                sum += this.crossProduct2dReduction(vertices[i], vertices[(i + 1) % (vertices.length - 1)]);
            }
        } catch (error) {
            console.log("Error in calculate polygon area: " + error);
        }
        const scaleValue = this.getScaleValue(pageNumber);
        return Math.abs(sum * 0.5) * scaleValue.xScaleValue * scaleValue.yScaleValue;
    }

    calculateReductionValues(annotation) {
        let area = 0;
        let length = 0;
        let volume = 0;
        let wall = 0;

        const scale = AnnotationStore.getScaleForPDFAnnotation(annotation);
        AnnotationStore.getReductionByParentAnnotationId(annotation.Id)
            .sort((reduction1, reduction2) => {
                if (reduction1.get("id") < reduction2.get("id")) {
                    return -1;
                }
                if (reduction1.get("id") > reduction2.get("id")) {
                    return 1;
                }
                return 0;
            })
            .forEach((reduction) => {
                const tempCalculator = new GeometricCalculation(
                    reduction.get("height"),
                    reduction.get("quantity"),
                    scale.get("x-scale"),
                    reduction.get("geoFile"),
                    scale.get("y-scale")
                );
                const vertices = tempCalculator.getVerticesFromXfdf(reduction.get("xfdf"));
                reduction = reduction.set("annotationData", Immutable.fromJS(tempCalculator.calculatePolygonValues(vertices)));
                reduction = tempCalculator.calculateFormulae(reduction);
                const reductionArea = reduction.getIn(["annotationData", "ESTIMATE.ANNOTATION_VALUES.AREA"]);
                const reductionLength = reduction.getIn(["annotationData", "ESTIMATE.ANNOTATION_VALUES.LENGTH"]);
                const reductionWall = reduction.getIn(["annotationData", "ESTIMATE.ANNOTATION_VALUES.WALL"]);
                area += reductionArea;
                length += reductionLength;
                volume += reductionArea * reduction.get("height");
                wall += reductionWall;
            });
        return {
            area,
            length,
            volume,
            wall,
        };
    }
}
