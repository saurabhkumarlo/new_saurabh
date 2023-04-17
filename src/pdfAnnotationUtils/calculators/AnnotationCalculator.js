import AnnotationStore from "../../stores/AnnotationStore";
import Immutable from "immutable";
import CalculationStore from "../../stores/CalculationStore";
import { RENDER_TYPES } from "constants/LabelsConstants";
import { ANNOT_TYPES } from "constants/AnnotationConstants";

export default class AnnotationCalculator {
    constructor() {
        this.GEOMETRA_TEXT_NO_FONT = "undefined";
        this.GEOMETRA_TEXT_FONT = "8px Arial";
        this.GEOMETRA_TEXT_FILL_STYLE = "#CC0000";
        this.GEOMETRA_DASHED_LINE_STYLE = "#00cf83";
        this.GEOMETRA_FONT_SIZE_INT = "undefined";
        this.GEOMETRA_FONT_TYPE = "px Arial";
        this.window = undefined;
        this.xScaleMap = new Immutable.Map();
        this.yScaleMap = new Immutable.Map();
    }

    getVerticesFromXfdf(xfdfString) {
        let vertices = undefined;
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(xfdfString, "text/xml");
        let element = xfdfElements.getElementsByTagName("vertices")[0];
        if (!element) {
            element = xfdfElements.getElementsByTagName("gesture")[0];
        }
        if (element) {
            vertices = element.childNodes[0].nodeValue;
            if (vertices) {
                vertices = vertices.split(";").map((point) => {
                    const values = point.split(",");
                    return [parseFloat(values[0]), parseFloat(values[1])];
                });
            }
        }
        return vertices;
    }

    getValueToDisplay(value, unit) {
        if (value) {
            switch (unit) {
                case "m":
                    if (AnnotationStore.showUsUnits()) {
                        return AnnotationStore.toUs(value);
                    } else {
                        return value.toLocaleString(CalculationStore.getIntlLang()) + " m";
                    }
                case "m2":
                    if (AnnotationStore.showUsUnits()) {
                        return AnnotationStore.toUsSquared(value);
                    } else {
                        return value.toLocaleString(CalculationStore.getIntlLang()) + " m²";
                    }
                case "m3":
                    if (AnnotationStore.showUsUnits()) {
                        return AnnotationStore.toUsVolume(value);
                    } else {
                        return value.toLocaleString(CalculationStore.getIntlLang()) + " m³";
                    }
                default:
                    break;
            }
        }
        return 0;
    }

    svgString2Image(svgString, width, height, format, opacity) {
        // Derived from: https://stackoverflow.com/questions/46814480/how-can-convert-a-base64-svg-image-to-base64-image-png
        format = format ? format : "png";
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        const image = new Image();
        image.src = svgString;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        context.alpha = opacity;
        const pngData = canvas.toDataURL("image/" + format);
        return pngData;
    }

    setScale(pageNumber, scale) {
        if (scale.Subject === "x-scale") {
            if (scale.converted) {
                this.yScaleMap = this.yScaleMap.set(pageNumber, undefined);
            }
            this.xScaleMap = this.xScaleMap.set(pageNumber, scale);
        } else if (scale.Subject === "y-scale") {
            this.yScaleMap = this.yScaleMap.set(pageNumber, scale);
        }
    }

    deleteScale(pageNumber, scale) {
        if (scale.Subject === "x-scale") {
            this.xScaleMap = this.xScaleMap.set(pageNumber, undefined);
        } else if (scale.Subject === "y-scale") {
            this.yScaleMap = this.yScaleMap.set(pageNumber, undefined);
        }
    }

    getDistanceFromPageCoordToPathPoint(pathPoint, mousePoint) {
        const dx = mousePoint.x - pathPoint.x;
        const dy = mousePoint.y - pathPoint.y;
        const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        return distance;
    }

    getClosestPointIndex(pageCoordinate, annotation) {
        let pointIndex = -1;
        let shortestDistance = 3;
        const path = annotation.getPath();
        for (let i = 0; i < path.length; i++) {
            const currentDistance = this.getDistanceFromPageCoordToPathPoint(path[i], pageCoordinate);
            if (currentDistance < shortestDistance) {
                shortestDistance = currentDistance;
                pointIndex = i;
            }
        }
        return pointIndex;
    }

    getFontSize(annotation) {
        let fontSize = 3;
        let minLength = undefined;
        if (annotation) {
            switch (annotation.Subject) {
                case "Polygon":
                    {
                        const path = annotation.getPath();
                        const length = path.length;
                        for (let i = 0; i < length - 1; i++) {
                            const p1 = annotation.getPathPoint(i);
                            const p2 = annotation.getPathPoint(i + 1);
                            const dx = p1.x - p2.x;
                            const dy = p1.y - p2.y;
                            const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                            if (!minLength) {
                                minLength = distance;
                            } else {
                                if (distance < minLength) {
                                    minLength = distance;
                                }
                            }
                        }
                        fontSize = minLength / 20;

                        if (fontSize > 6) {
                            fontSize = 6;
                        } else if (fontSize < 3) {
                            fontSize = 3;
                        }
                    }
                    break;
                case "Reduction":
                    {
                        const path = annotation.getPath();
                        const length = path.length;
                        for (let i = 0; i < length - 1; i++) {
                            const p1 = annotation.getPathPoint(i);
                            const p2 = annotation.getPathPoint(i + 1);
                            const dx = p1.x - p2.x;
                            const dy = p1.y - p2.y;
                            const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                            if (!minLength) {
                                minLength = distance;
                            } else {
                                if (distance < minLength) {
                                    minLength = distance;
                                }
                            }
                        }
                        fontSize = minLength / 20;

                        if (fontSize > 6) {
                            fontSize = 6;
                        } else if (fontSize < 3) {
                            fontSize = 3;
                        }
                    }
                    break;
                case "Polyline":
                    {
                        const path = annotation.getPath();
                        const length = path.length;
                        for (let i = 0; i < length - 1; i++) {
                            const p1 = annotation.getPathPoint(i);
                            const p2 = annotation.getPathPoint(i + 1);
                            const dx = p1.x - p2.x;
                            const dy = p1.y - p2.y;
                            const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                            if (!minLength) {
                                minLength = distance;
                            } else {
                                if (distance < minLength) {
                                    minLength = distance;
                                }
                            }
                        }
                        fontSize = minLength / 20;
                        if (fontSize > 6) {
                            fontSize = 6;
                        } else if (fontSize < 3) {
                            fontSize = 3;
                        }
                    }
                    break;
                case "Point":
                    fontSize = annotation.Width / 5;
                    if (fontSize > 6) {
                        fontSize = 6;
                    } else if (fontSize < 3) {
                        fontSize = 3;
                    }
                    break;
                case "Ellipse":
                    fontSize = Math.min(annotation.Width, annotation.Height) / 20;
                    if (fontSize > 6) {
                        fontSize = 6;
                    } else if (fontSize < 3) {
                        fontSize = 3;
                    }
                    break;
                case "annotation.freeHand":
                case "Free hand":
                case "Free Hand":
                    fontSize = Math.min(annotation.Width, annotation.Height) / 20;
                    break;
                default:
            }
        }
        return fontSize;
    }

    getScale(pageNumber) {
        return this.xScaleMap.get(pageNumber);
    }

    getScaleValue(pageNumber) {
        const scaleValue = { xScaleValue: 1, yScaleValue: 1 };
        const xScale = this.xScaleMap.get(pageNumber);
        const yScale = this.yScaleMap.get(pageNumber);
        if (xScale) {
            const dx = xScale.getPathPoint(1).x - xScale.getPathPoint(0).x;
            const dy = xScale.getPathPoint(1).y - xScale.getPathPoint(0).y;
            const scaleDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            scaleValue.xScaleValue = parseFloat(xScale.length) / scaleDistance;
            if (yScale) {
                const dx = yScale.getPathPoint(1).x - yScale.getPathPoint(0).x;
                const dy = yScale.getPathPoint(1).y - yScale.getPathPoint(0).y;
                const scaleDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                scaleValue.yScaleValue = yScale.length / scaleDistance;
            } else {
                scaleValue.yScaleValue = scaleValue.xScaleValue;
            }
        }
        return scaleValue;
    }

    getRotatedPoint(origo, point, rotation) {
        rotation = (rotation / 180) * Math.PI;
        const transPosedX = point.x - origo.x;
        const transPosedY = point.y - origo.y;
        const internalRotaiotn = Math.atan2(transPosedY, transPosedX);

        const rotatedX = transPosedX * Math.cos(-internalRotaiotn - rotation) - transPosedY * Math.sin(-internalRotaiotn - rotation);
        const rotatedY = transPosedY * Math.cos(-internalRotaiotn - rotation) + transPosedX * Math.sin(-internalRotaiotn - rotation);
        return new this.window.Annotations.Point(rotatedX + origo.x, rotatedY + origo.y);
    }

    setWindow(window) {
        this.window = window;
    }

    roundRect(ctx, x, y, w, h) {
        const r = 1;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    }

    getColorWithOpacity(color, opacity) {
        let hexOpacityValue = (opacity * 255).toString(16).split(".")[0];
        if (hexOpacityValue.length === 1) hexOpacityValue = `0${hexOpacityValue}`;
        return `${color}${hexOpacityValue}`;
    }

    drawCentralLabels(ctx, centerTextToShow, styles, annotation, rotation) {
        let centerX, centerY;
        if (annotation.Subject === ANNOT_TYPES.ELLIPSE) {
            const rect = annotation.getRect();
            centerX = annotation.X + rect.getWidth() / 2;
            centerY = annotation.Y + rect.getHeight() / 2;
        } else {
            centerX = annotation.X + annotation.Width / 2;
            centerY = annotation.Y + annotation.Height / 2;
        }

        const fontSize = Number(styles.fontSize);
        const x = Number(styles.x);
        const y = Number(styles.y);
        const fontStyles = styles.fontStyles ? styles.fontStyles.join(" ") : "";
        const bgPadding = fontSize / 2;

        let textY;
        let bgWidth;
        let bgHeight;
        let bgX;
        let bgY;

        ctx.save();
        ctx.textAlign = "center";
        ctx.font = `${fontStyles} ${fontSize}px ${styles.font}`;

        ctx.translate(centerX + x, centerY + y);
        ctx.rotate(rotation);

        switch (styles.render) {
            case RENDER_TYPES.ROWS.value:
                bgWidth = ctx.measureText(centerTextToShow.sort((a, b) => b.length - a.length)[0]).width + bgPadding;
                bgHeight = centerTextToShow.length * fontSize + bgPadding;
                bgX = -bgWidth / 2;
                bgY = -bgHeight / 2 - bgPadding / 2;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                textY = (-(centerTextToShow.length - 1) * fontSize) / 2;
                for (let i = 0; i < centerTextToShow.length; i++) {
                    ctx.fillText(centerTextToShow[i], 0, textY);
                    textY += fontSize;
                }
                break;
            case RENDER_TYPES.INLINE.value:
                const text = centerTextToShow.join(" | ");
                bgWidth = ctx.measureText(text).width + bgPadding;
                bgHeight = fontSize + bgPadding;
                bgX = -bgWidth / 2;
                bgY = -fontSize;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                ctx.fillText(text, 0, 0);
                break;
            default:
                const rowTextArray = [];
                let rowText = "";
                for (let i = 0; i < centerTextToShow.length; i++) {
                    if (i % 4 === 0 && i !== 0) {
                        rowTextArray.push(rowText);
                        rowText = centerTextToShow[i];
                        textY += fontSize;
                    } else {
                        rowText = rowText + centerTextToShow[i];
                    }
                    if (i % 4 !== 3 && i !== centerTextToShow.length - 1) rowText = rowText + " | ";
                }
                if (rowText) rowTextArray.push(rowText);

                bgWidth = ctx.measureText(rowTextArray.sort((a, b) => b.length - a.length)[0]).width + bgPadding;
                bgHeight = rowTextArray.length * fontSize + bgPadding;
                bgX = -bgWidth / 2;
                bgY = -bgHeight / 2;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                textY = -(((Math.ceil(centerTextToShow.length / 4) - 1) * fontSize) / 2 - fontSize / 4);
                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                rowTextArray.forEach((row) => {
                    ctx.fillText(row, 0, textY);
                    textY += fontSize;
                });
                break;
        }
        ctx.restore();
    }
}
