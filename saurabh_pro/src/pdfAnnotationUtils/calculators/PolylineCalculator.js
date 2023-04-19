import { ANNOT_TYPES } from "constants/AnnotationConstants";
import { LABELS, markerTypes } from "constants/LabelsConstants";
import { X_SCALE_NAME, Y_SCALE_NAME } from "../../constants/ScaleConstants";

import AnnotationCalculator from "./AnnotationCalculator";
import AnnotationStore from "../../stores/AnnotationStore";
import GeometricCalculation from "utils/GeometricCalculation";
import _ from "lodash";

export default class PolylineCalculator extends AnnotationCalculator {
    constructor() {
        super();
        this.arrowFunctions = {
            ">|": this.drawGTPipe,
            "|<": this.drawPipeLT,
            "->|": this.drawDashGTPipe,
            "|<-": this.drawPipeLTDash,
            "-": this.drawDash,
            ">": this.drawGT,
            "<": this.drawLT,
            "|": this.drawPipe,
            "o-": this.drawCircle,
            "o|-": this.drawDashCircle,
        };
    }

    buildOrDrawPolylineData(annotation, ctx, rotation) {
        const newAnnotation = annotation.newAnnotation;
        const isFreeHand =
            annotation.Subject === ANNOT_TYPES.FREE_HAND || annotation.Subject === ANNOT_TYPES.FREE_HAND2 || annotation.Subject === ANNOT_TYPES.FREE_HAND3;
        const isScale = annotation.Subject === ANNOT_TYPES.X_SCALE || annotation.Subject === ANNOT_TYPES.Y_SCALE;
        const isScaleExist = this.getScale(annotation.PageNumber);
        const scaleData = AnnotationStore.getScaleForPDFAnnotation(annotation);

        const labels = annotation.labels;
        const activeLabels = labels?.active;
        const styles = labels?.sideStyles;
        const areSides = activeLabels?.length > 0;
        const isAnnotSelected =
            AnnotationStore.getSelectedAnnotationIds().size === 1 && AnnotationStore.getSelectedAnnotationIds().first().get("annotationId") === annotation.Id;

        let path = undefined;
        if (isFreeHand && annotation.getPath(0)) {
            path = annotation.getPath(0);
        } else if (annotation.getPath()) {
            path = annotation.getPath();
        }

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

        if (path && newAnnotation && isScaleExist) {
            this.drawNewAnnotationLength(path, ctx, rotation, annotation.getPageNumber());
        } else if ((path && areSides) || isAnnotSelected) {
            const isClockwiseOrder = this.checkIsClockwiseOrder(path);

            for (let i = 0; i < path.length - 1; i++) {
                let distance = -1;

                const x1 = annotation.getPathPoint(i).x;
                const x2 = annotation.getPathPoint(i + 1).x;
                const x = (x1 + x2) / 2;
                const dx = isClockwiseOrder ? x2 - x1 : x1 - x2;

                const y1 = annotation.getPathPoint(i).y;
                const y2 = annotation.getPathPoint(i + 1).y;
                const y = (y1 + y2) / 2;
                const dy = isClockwiseOrder ? y2 - y1 : y1 - y2;

                if (isScale) distance = annotation.length;
                else {
                    const scaleValue = this.getScaleValue(annotation.PageNumber);
                    distance = Math.sqrt(Math.pow(dx * scaleValue.xScaleValue, 2) + Math.pow(dy * scaleValue.yScaleValue, 2));
                }

                if (isAnnotSelected && !areSides && !isFreeHand && !isScale) {
                    this.drawMarker(ctx, x, y, dx, dy, i, styles, rotation);
                    this.drawAngles(ctx, path, rotation, annotation);
                }

                if (areSides) {
                    const textToShow = this.getPolylineLabels(annotation, activeLabels, calculator, i, distance);
                    const fontSize = Number(styles.fontSize);
                    if (textToShow.length) this.drawPolylineLabel(ctx, annotation, i, textToShow, styles, fontSize, isClockwiseOrder, rotation);
                    if (isAnnotSelected && !isFreeHand && !isScale) {
                        this.drawMarker(ctx, x, y, dx, dy, i, styles, rotation, fontSize, textToShow);
                        this.drawAngles(ctx, path, rotation, annotation);
                    }
                }
            }
        }
    }

    drawPolylineLabel(ctx, annotation, i, textToShow, styles, fontSize, isClockwiseOrder, rotation) {
        const isFollow = localStorage.getItem("sideLabelsPosition") !== "static";
        const fontStyles = styles.fontStyles ? styles.fontStyles.join(" ") : "";
        const x1 = annotation.getPathPoint(i).x;
        const x2 = annotation.getPathPoint(i + 1).x;
        const x = (x1 + x2) / 2;
        const dx = isClockwiseOrder ? x2 - x1 : x1 - x2;

        const y1 = annotation.getPathPoint(i).y;
        const y2 = annotation.getPathPoint(i + 1).y;
        const y = (y1 + y2) / 2;
        const dy = isClockwiseOrder ? y2 - y1 : y1 - y2;

        ctx.save();

        ctx.font = `${fontStyles} ${fontSize}px ${styles.font}`;
        ctx.textAlign = "center";

        const bgPadding = fontSize / 2;
        const bgWidth = ctx.measureText(textToShow.sort((a, b) => b.length - a.length)[0]).width + bgPadding;
        const bgHeight = textToShow.length * fontSize + bgPadding;
        const bgX = -bgWidth / 2;
        const margin = styles.margin || 0;

        let tempY;
        let bgY;

        ctx.translate(x, y);
        if (isFollow) {
            tempY = this.shouldRotate(dx, dy) ? -bgPadding + bgPadding / 4 - (textToShow.length - 1) * fontSize - margin : fontSize + bgPadding / 4 + margin;
            bgY = this.shouldRotate(dx, dy) ? -bgHeight - margin : margin;
            ctx.rotate(this.getRotation(dx, dy));
        } else {
            tempY = fontSize + bgPadding / 4 + margin - bgHeight / 2;
            bgY = margin - bgHeight / 2;
            ctx.rotate(rotation);
        }

        ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
        this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

        ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
        for (let i = 0; i < textToShow.length; i++) {
            ctx.fillText(textToShow[i], 0, tempY);
            tempY += fontSize;
        }

        ctx.restore();
    }

    drawMarker(ctx, x, y, dx, dy, i, styles, rotation, fontSize = 0, textToShow = []) {
        const isFollow = localStorage.getItem("sideLabelsPosition") !== "static";
        const markersSize = localStorage.getItem("markersSize") || "medium";
        const markerSize = _.find(markerTypes, (type) => type.key === markersSize).size;
        const bgPadding = markerSize / 2;
        const sideLabelMargin = styles?.margin || 0;

        ctx.save();
        ctx.font = `${markerSize}px Arial Narrow`;
        ctx.textAlign = "center";

        const bgWidth = ctx.measureText(i + 1).width + bgPadding;
        const bgHeight = markerSize + bgPadding;
        const bgX = -bgWidth / 2;
        let bgY;
        let textY;

        ctx.translate(x, y);
        if (isFollow) {
            bgY = this.shouldRotate(dx, dy) ? -sideLabelMargin : sideLabelMargin - bgHeight;
            textY = this.shouldRotate(dx, dy) ? markerSize - sideLabelMargin : sideLabelMargin - markerSize / 3;
            ctx.rotate(this.getRotation(dx, dy));
        } else {
            let sideLabelHeight = 0;
            if (fontSize && textToShow.length > 0) sideLabelHeight = (textToShow.length * fontSize + fontSize / 2) / 2;

            bgY = sideLabelMargin - bgHeight - sideLabelHeight;
            textY = sideLabelMargin - markerSize / 3 - sideLabelHeight;
            ctx.rotate(rotation);
        }

        ctx.fillStyle = "#4E5256";
        this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(i + 1, 0, textY);
        ctx.restore();
    }

    getPolylineLabels(annotation, activeLabels, calculator, i, distance) {
        const textToShow = [];
        const isPolyline = annotation.Subject === ANNOT_TYPES.POLYLINE;
        const isScale = annotation.Subject === ANNOT_TYPES.X_SCALE || annotation.Subject === ANNOT_TYPES.Y_SCALE;
        const isFreeHand =
            annotation.Subject === ANNOT_TYPES.FREE_HAND || annotation.Subject === ANNOT_TYPES.FREE_HAND2 || annotation.Subject === ANNOT_TYPES.FREE_HAND3;
        const isScaleExist = this.getScale(annotation.PageNumber);
        const annotVertices = annotation.vertices;

        let length = 0;
        let wall = 0;
        if (calculator) {
            length = calculator.calculateLineLength(annotVertices)["ESTIMATE.ANNOTATION_VALUES.LENGTH"] || 0;
            wall = calculator.calculateLineSurfaceArea(annotVertices);
        }

        if (!isFreeHand) {
            if (activeLabels.includes(LABELS.NR_TAG) && (isPolyline || isScale)) textToShow.push("[" + annotation.annotationNumber + "]");

            if (activeLabels.includes(LABELS.NAME) && (isPolyline || isScale)) textToShow.push(annotation.annotationName);

            if (activeLabels.includes(LABELS.VARIABLES)) {
                if (activeLabels.includes(LABELS.LENGTH) && (isPolyline || isScale)) textToShow.push("L: " + this.getValueToDisplay(length, "m"));
                else if (isPolyline || isScale) textToShow.push("L");

                if (activeLabels.includes(LABELS.WALL) && (isPolyline || isScale)) textToShow.push("V: " + this.getValueToDisplay(wall, "m2"));
                else if (isPolyline || isScale) textToShow.push("V");

                if (activeLabels.includes(LABELS.NET_LENGTH) && (isPolyline || isScale))
                    textToShow.push("NL: " + this.getValueToDisplay(this.calculatePolylineNetLineLength(annotation), "m"));
                else if (isPolyline || isScale) textToShow.push("NL");

                if (activeLabels.includes(LABELS.NET_WALL) && (isPolyline || isScale))
                    textToShow.push("NV: " + this.getValueToDisplay(this.calculatePolylineNetWall(annotation, annotation.PageNumber), "m2"));
                else if (isPolyline || isScale) textToShow.push("NV");

                if (activeLabels.includes(LABELS.LENGTHS) && isScaleExist) textToShow.push("L" + (i + 1) + ": " + this.getValueToDisplay(distance, "m"));
                else textToShow.push("L" + (i + 1));

                if (activeLabels.includes(LABELS.WALLS) && isScaleExist)
                    textToShow.push("(V" + (i + 1) + ": " + this.getValueToDisplay(distance * annotation.annotationHeight, "m2") + ")");
                else textToShow.push("(V" + (i + 1) + ")");
            } else if (isScaleExist) {
                if (activeLabels.includes(LABELS.LENGTH) && (isPolyline || isScale)) textToShow.push("" + this.getValueToDisplay(length, "m"));

                if (activeLabels.includes(LABELS.WALL) && (isPolyline || isScale)) textToShow.push("" + this.getValueToDisplay(wall, "m2"));

                if (activeLabels.includes(LABELS.NET_LENGTH) && (isPolyline || isScale))
                    textToShow.push("" + this.getValueToDisplay(this.calculatePolylineNetLineLength(annotation), "m"));

                if (activeLabels.includes(LABELS.NET_WALL) && (isPolyline || isScale))
                    textToShow.push("" + this.getValueToDisplay(this.calculatePolylineNetWall(annotation, annotation.PageNumber), "m2"));

                if (activeLabels.includes(LABELS.LENGTHS)) textToShow.push("" + this.getValueToDisplay(distance, "m"));

                if (activeLabels.includes(LABELS.WALLS)) textToShow.push("(" + this.getValueToDisplay(distance * annotation.annotationHeight, "m2") + ")");
            }
        }

        return textToShow;
    }

    drawAngles(ctx, vertices, rotation, annotation) {
        if (vertices && ctx) {
            const isPolyline = annotation.Subject === ANNOT_TYPES.POLYLINE;
            const isClockwiseOrder = this.checkIsClockwiseOrder(vertices);
            const markersSize = localStorage.getItem("markersSize") || "medium";
            const fontSize = _.find(markerTypes, (type) => type.key === markersSize).size;
            const totalLength = isPolyline ? vertices.length - 2 : vertices.length - 1;

            for (let i = 0; i < totalLength; i++) {
                const isLastElement = i === vertices.length - 2;
                const x1 = vertices[i].x;
                const x2 = vertices[i + 1].x;
                const x3 = isLastElement ? vertices[1].x : vertices[i + 2].x;
                const dx1 = x1 - x2;
                const dx2 = x3 - x2;

                const y1 = vertices[i].y;
                const y2 = vertices[i + 1].y;
                const y3 = isLastElement ? vertices[1].y : vertices[i + 2].y;
                const dy1 = y1 - y2;
                const dy2 = y3 - y2;

                const a1 = isClockwiseOrder ? Math.atan2(dy2, dx2) : Math.atan2(dy1, dx1);
                const a2 = isClockwiseOrder ? Math.atan2(dy1, dx1) : Math.atan2(dy2, dx2);
                const a = parseFloat((((a2 - a1) * 180) / Math.PI + 360) % 360).toFixed(2);

                const textX = x2;
                const textY = y2 + fontSize / 2;

                ctx.save();
                ctx.font = `${fontSize}px Arial Narrow`;
                ctx.textAlign = "center";

                ctx.beginPath();
                ctx.arc(x2, y2, fontSize * 1.25, a1, a2);
                ctx.strokeStyle = "#E61C27";
                ctx.stroke();
                ctx.closePath();

                ctx.translate(textX, textY);
                ctx.rotate(rotation);
                ctx.fillStyle = "#E61C27";
                ctx.fillText(`${a}°`, 0, 0);

                ctx.restore();
            }
        }
    }

    getRotation(dx, dy) {
        if (this.shouldRotate(dx, dy)) return Math.atan2(-dy, -dx);
        else return Math.atan2(dy, dx);
    }

    shouldRotate(dx, dy) {
        return (dx < 0 && dy <= 0) || (dx < 0 && dy > 0);
    }

    checkIsClockwiseOrder(path) {
        let sum = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const x1 = path[i].x;
            const x2 = path[i + 1].x;
            const y1 = path[i].y;
            const y2 = path[i + 1].y;

            const value = (x2 - x1) * (y2 + y1);
            sum += value;
        }
        return sum <= 0;
    }

    // Pipe = |
    // LT = <
    // PipeLT = |<
    drawPipeLT(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);

        ctx.save();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);

        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);

        ctx.stroke();
        ctx.restore();
    }

    // Pipe = |
    // GT = >
    // GTPipe = >|
    drawGTPipe(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation + Math.PI);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 10);

        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);

        ctx.stroke();
        ctx.restore();
    }

    // GT = >
    drawGT(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation + Math.PI);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 10);

        ctx.stroke();
        ctx.restore();
    }

    // LT = <
    drawLT(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 10);

        ctx.stroke();
        ctx.restore();
    }

    // Dash = -
    // GT = >
    // Pipe = |
    // DashGTPipe = ->|
    drawDashGTPipe(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation + Math.PI);
        ctx.beginPath();

        // GT
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 10);

        // Pipe
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);

        // Dash
        ctx.moveTo(-10, 0);
        ctx.lineTo(0, 0);

        ctx.stroke();
        ctx.restore();
    }

    // Pipe = |
    // LT = <
    // Dash = -
    // PipeLTDash = |<-
    drawPipeLTDash(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();

        // GT
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, 10);

        // Pipe
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);

        ctx.stroke();
        ctx.restore();
    }

    // Dash = -
    drawDash(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();

        ctx.stroke();
        ctx.restore();
    }

    // Pipe = |
    drawPipe(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();

        // Pipe
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 10);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);

        ctx.stroke();
        ctx.restore();
    }

    drawCircle(ctx, annotation, pathPoint) {
        const dx = annotation.getPathPoint(0).x - annotation.getPathPoint(1).x;
        const dy = annotation.getPathPoint(0).y - annotation.getPathPoint(1).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    drawDashCircle(ctx, annotation, pathPoint) {
        const pathBegin = pathPoint === 0 ? 0 : pathPoint;
        const pathEnd = pathPoint === 0 ? 1 : pathPoint - 1;

        const dx = annotation.getPathPoint(pathBegin).x - annotation.getPathPoint(pathEnd).x;
        const dy = annotation.getPathPoint(pathBegin).y - annotation.getPathPoint(pathEnd).y;
        const rotation = Math.atan2(dy, dx);
        ctx.save();
        ctx.strokeStyle = annotation.StrokeColor.toString();
        ctx.lineWidth = annotation.StrokeThickness;
        ctx.translate(annotation.getPathPoint(pathPoint).x, annotation.getPathPoint(pathPoint).y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 12);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -12);
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 7, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    drawArrows(ctx, annotation) {
        const newAnnotation = annotation.newAnnotation;
        const newScale = annotation.newScale;
        const isScale = annotation.Subject === X_SCALE_NAME || annotation.Subject === Y_SCALE_NAME;

        if (!(newAnnotation || newScale) && annotation.getPath()) {
            const lineLastIndex = annotation.getPath().length - 1;

            if (!annotation.geometraLineStart && isScale) {
                this.arrowFunctions["|<-"] && this.arrowFunctions["|<-"](ctx, annotation, 0);
            } else {
                this.arrowFunctions[annotation.geometraLineStart] && this.arrowFunctions[annotation.geometraLineStart](ctx, annotation, 0);
            }

            if (!annotation.geometraLineEnd && isScale) {
                this.arrowFunctions["|<-"] && this.arrowFunctions["|<-"](ctx, annotation, 1);
            } else {
                this.arrowFunctions[annotation.geometraLineEnd] && this.arrowFunctions[annotation.geometraLineEnd](ctx, annotation, lineLastIndex);
            }
        }
    }

    pointBetweenTwoPonts(linePoint1, linePoint2, pointToCheck) {
        const d0 = {};
        d0.x = linePoint2.x - linePoint1.x;
        d0.y = linePoint2.y - linePoint1.y;

        const d0Mag = Math.sqrt(Math.pow(d0.x, 2) + Math.pow(d0.y, 2));
        const v = {};
        v.x = d0.x / d0Mag;
        v.y = d0.y / d0Mag;

        const d1 = {};
        d1.x = pointToCheck.x - linePoint1.x;
        d1.y = pointToCheck.y - linePoint1.y;
        const dotProd = v.x * d1.x + v.y * d1.y;
        if (dotProd > 0 && dotProd < d0Mag) {
            return true;
        }
        return false;
    }

    //Getting the distance from point to be added to a line of IPathAnnotation
    // The line is defined by two points
    getDistanceFromPointToLine(p1, p2, p0) {
        const numerator = Math.abs((p2.y - p1.y) * p0.x - (p2.x - p1.x) * p0.y + p2.x * p1.y - p2.y * p1.x);
        const denomerator = Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
        return numerator / denomerator;
    }

    // Geting the index for the point to be added to a IPathAnnotations.
    getPathIndex(pageCoordinate, annotation) {
        let pointIndex = -1;
        let shortestDistance = 1;
        const path = annotation.getPath();
        for (let i = 0; i < path.length - 1; i++) {
            const currentDistance = this.getDistanceFromPointToLine(path[i], path[i + 1], pageCoordinate);
            if (currentDistance < shortestDistance && this.pointBetweenTwoPonts(path[i], path[i + 1], pageCoordinate)) {
                shortestDistance = currentDistance;
                pointIndex = i + 1;
            }
        }
        return pointIndex;
    }

    drawNewAnnotationLength(vertices, ctx, rotation, pageNumber, polygon = false) {
        if (vertices.length === 2) {
            const dx = vertices[0].x - vertices[1].x;
            const dy = vertices[0].y - vertices[1].y;
            const xValue = Math.abs(dx);
            const yValue = Math.abs(dy);
            const x = (vertices[0].x + vertices[vertices.length - 1].x) / 2;
            const y = (vertices[0].y + vertices[vertices.length - 1].y) / 2;
            const x1 = x - dx / 2;
            const y1 = y;
            const x2 = x;
            const y2 = y - dy / 2;
            let firstDistance = 0;
            const scaleValue = this.getScaleValue(pageNumber);
            if (polygon) {
                firstDistance = xValue * yValue * scaleValue.xScaleValue * scaleValue.yScaleValue;
            } else {
                firstDistance = Math.sqrt(Math.pow(dx * scaleValue.xScaleValue, 2) + Math.pow(dy * scaleValue.yScaleValue, 2));
            }
            ctx.save();
            ctx.textAlign = "center";
            ctx.translate(x, y);
            ctx.rotate(rotation);
            if (polygon) {
                ctx.fillText(this.getValueToDisplay(firstDistance, "m2"), 0, 0);
            } else {
                ctx.fillText(this.getValueToDisplay(firstDistance, "m"), 0, 0);
            }
            ctx.restore();
            if (polygon && xValue > 0 && yValue > 0) {
                ctx.save();
                ctx.textAlign = "center";
                ctx.translate(x1, y1);
                ctx.rotate(rotation);
                ctx.fillText(this.getValueToDisplay(yValue * scaleValue.yScaleValue, "m"), 0, 0);
                ctx.restore();
                ctx.save();
                ctx.textAlign = "center";
                ctx.translate(x2, y2);
                ctx.rotate(rotation);
                ctx.fillText(this.getValueToDisplay(xValue * scaleValue.xScaleValue, "m"), 0, 0);
                ctx.restore();
            }
        } else if (vertices.length > 2) {
            const scaleValue = this.getScaleValue(pageNumber);
            const dx = vertices[vertices.length - 1].x - vertices[vertices.length - 2].x;
            const dy = vertices[vertices.length - 1].y - vertices[vertices.length - 2].y;
            const x = (vertices[vertices.length - 1].x + vertices[vertices.length - 2].x) / 2;
            const y = (vertices[vertices.length - 1].y + vertices[vertices.length - 2].y) / 2;
            const firstDistance = Math.sqrt(Math.pow(dx * scaleValue.xScaleValue, 2) + Math.pow(dy * scaleValue.yScaleValue, 2));
            ctx.save();
            ctx.textAlign = "center";
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(this.getValueToDisplay(firstDistance, "m"), 0, 0);
            ctx.restore();
        }
    }

    getDegreStepRotation(rotationDegrees) {
        if (rotationDegrees >= 0 && rotationDegrees < 7.5) {
            return 0;
        }
        if (rotationDegrees >= 7.5 && rotationDegrees < 22.5) {
            return 15;
        }
        if (rotationDegrees >= 22.5 && rotationDegrees < 37.5) {
            return 30;
        }
        if (rotationDegrees >= 37.5 && rotationDegrees < 52.5) {
            return 45;
        }
        if (rotationDegrees >= 52.5 && rotationDegrees < 67.5) {
            return 60;
        }
        if (rotationDegrees >= 67.5 && rotationDegrees < 82.5) {
            return 75;
        }
        if (rotationDegrees >= 82.5 && rotationDegrees < 97.5) {
            return 90;
        }
        if (rotationDegrees >= 97.5 && rotationDegrees < 112.5) {
            return 105;
        }
        if (rotationDegrees >= 112.5 && rotationDegrees < 127.5) {
            return 120;
        }
        if (rotationDegrees >= 127.5 && rotationDegrees < 142.5) {
            return 135;
        }
        if (rotationDegrees >= 142.5 && rotationDegrees < 157.5) {
            return 150;
        }
        if (rotationDegrees >= 157.5 && rotationDegrees < 172.5) {
            return 165;
        }
        if (rotationDegrees >= 172.5 && rotationDegrees < 187.5) {
            return 180;
        }
        if (rotationDegrees >= 187.5 && rotationDegrees < 202.5) {
            return 195;
        }
        if (rotationDegrees >= 202.5 && rotationDegrees < 217.5) {
            return 210;
        }
        if (rotationDegrees >= 217.5 && rotationDegrees < 232.5) {
            return 225;
        }
        if (rotationDegrees >= 232.5 && rotationDegrees < 247.5) {
            return 240;
        }
        if (rotationDegrees >= 247.5 && rotationDegrees < 262.5) {
            return 255;
        }
        if (rotationDegrees >= 262.5 && rotationDegrees < 277.5) {
            return 270;
        }
        if (rotationDegrees >= 277.5 && rotationDegrees < 292.5) {
            return 285;
        }
        if (rotationDegrees >= 292.5 && rotationDegrees < 307.5) {
            return 300;
        }
        if (rotationDegrees >= 307.5 && rotationDegrees < 322.5) {
            return 315;
        }

        if (rotationDegrees >= 322.5 && rotationDegrees < 337.5) {
            return 330;
        }
        if (rotationDegrees >= 337.5 && rotationDegrees < 352.5) {
            return 345;
        }
        if (rotationDegrees >= 352 && rotationDegrees <= 360) {
            return 0;
        }
    }
    calculatePolylineLineLength(annotation, pageNumber) {
        let vertices = undefined;
        if (annotation.Subject === "annotation.freeHand" || annotation.Subject === "Free Hand" || annotation.Subject === "Free hand") {
            vertices = annotation.getPath(0);
        } else {
            vertices = annotation.getPath();
        }
        let lineLength = 0;
        const scaleValue = this.getScaleValue(pageNumber);
        if (vertices) {
            for (let i = 0; i < vertices.length - 1; i++) {
                const dx = (vertices[i].x - vertices[i + 1].x) * scaleValue.xScaleValue;
                const dy = (vertices[i].y - vertices[i + 1].y) * scaleValue.yScaleValue;
                const vectorDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                lineLength += vectorDistance;
            }
            return lineLength;
        }
        return undefined;
    }

    calculatePolylineLineLengthStoreReduction(vertices, pageNumber) {
        let lineLength = 0;
        const scaleValue = this.getScaleValue(pageNumber);
        if (vertices) {
            for (let i = 0; i < vertices.length - 1; i++) {
                const dx = (vertices[i][0] - vertices[i + 1][0]) * scaleValue.xScaleValue;
                const dy = (vertices[i][1] - vertices[i + 1][1]) * scaleValue.yScaleValue;
                const vectorDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                lineLength += vectorDistance;
            }
            return lineLength;
        }
        return undefined;
    }

    calculatePolylineNetLineLength(annotation, pageNumber) {
        let netLineLength = undefined;
        if (annotation.formulaNL) {
            netLineLength = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNL, "ESTIMATE.ANNOTATION_VALUES.LENGTH");
            return netLineLength;
        }
        netLineLength = this.calculatePolylineLineLength(annotation, annotation.PageNumber);
        if (annotation.Subject === "Polygon") {
            const reductions = AnnotationStore.getReductionByParentAnnotationId(annotation.Id);
            reductions.forEach((storeReduction) => {
                netLineLength -=
                    this.calculatePolylineLineLengthStoreReduction(this.getVerticesFromXfdf(storeReduction.get("xfdf")), storeReduction.get("pageNumber")) *
                    storeReduction.get("quantity");
            });
        }
        return netLineLength;
    }

    calculatePolylineNetWall(annotation, pageNumber) {
        let netWall = undefined;
        if (annotation.formulaNV) {
            netWall = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNV, "ESTIMATE.ANNOTATION_VALUES.WALL");
            return netWall;
        }
        netWall = this.calculatePolylineLineLength(annotation, pageNumber) * annotation.annotationHeight;
        if (annotation.Subject === "Polygon") {
            const reductions = AnnotationStore.getReductionByParentAnnotationId(annotation.Id);
            reductions.forEach((storeReduction) => {
                netWall -=
                    this.calculatePolylineLineLengthStoreReduction(this.getVerticesFromXfdf(storeReduction.get("xfdf")), storeReduction.get("pageNumber")) *
                    storeReduction.get("height") *
                    storeReduction.get("quantity");
            });
        }
        return netWall;
    }
}
