import { all, create } from "mathjs";

import CalculationStore from "../stores/CalculationStore";
import FileStore from "../stores/FileStore";
import _ from "lodash";

const config = {};
const mathjs = create(all, config);
export default class GeometricCalculation {
    constructor(height, quantity, xScale, geoFile, yScale = undefined) {
        this.height = height;
        this.xScale = 1;
        this.yScale = 1;
        if (xScale) {
            this.xScale = this.getScaleValueFromXfdf(xScale.get("xdf"), xScale.get("length"));
            this.yScale = this.xScale;
        }
        if (yScale) {
            this.yScale = this.getScaleValueFromXfdf(yScale.get("xdf"), yScale.get("length"));
        }
        this.quantity = quantity;
        this.fileName = undefined;
        if (geoFile) {
            const fileId = typeof geoFile === "number" ? geoFile : geoFile.get("id");
            const file = FileStore.getFileById(fileId);
            if (file) {
                this.fileName = file.name;
            }
        }
    }

    // Utility
    getRectFromXfdf(xfdfString) {
        if (!xfdfString) return {};

        let rect = undefined;
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(xfdfString, "text/xml");
        const annotations = xfdfElements.querySelector("annots").children;

        _.forEach(annotations, (annotElement) => {
            rect = annotElement.getAttribute("rect");
        });
        rect = JSON.parse("[" + rect + "]");
        return rect;
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

    getCenterPoint(annotation) {
        const rect = this.getRectFromXfdf(annotation.get("xfdf") || annotation.get("xdf"));
        const x = rect[0];
        const y = rect[1];
        const x1 = rect[2];
        const y1 = rect[3];
        const dx = x1 - x;
        const dy = y1 - y;
        const centerX = x + dx / 2;
        const centerY = y + dy / 2;
        return [centerX, centerY];
    }

    getCenterPointFromXfdf(xfdfString) {
        const rect = this.getRectFromXfdf(xfdfString);
        const x = rect[0];
        const y = rect[1];
        const x1 = rect[2];
        const y1 = rect[3];
        const dx = x1 - x;
        const dy = y1 - y;
        const centerX = x + dx / 2;
        const centerY = y + dy / 2;

        return [centerX, centerY];
    }

    getScaleValueFromXfdf(xfdfString, length) {
        const vertices = this.getVerticesFromXfdf(xfdfString);
        return mathjs.divide(length, mathjs.distance(vertices[0], vertices[1])).valueOf();
    }

    crossProduct2d(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    // Polygon
    calculatePolygonArea(vertices) {
        let sum = 0.0;
        if (vertices && vertices.length < 3) {
            return undefined;
        }
        for (let i = 0; i < vertices.length - 1; i++) {
            sum += this.crossProduct2d(vertices[i], vertices[(i + 1) % (vertices.length - 1)]);
        }
        const area = mathjs.chain(sum).multiply(0.5).multiply(this.quantity).abs().multiply(this.xScale).multiply(this.yScale).valueOf();
        if (this.quantity < 0) {
            return -1 * area;
        }
        return area;
    }

    calculatePolygonLenghts(vertices) {
        const lines = [];
        let sumLines = 0.0;
        if (vertices) {
            for (let i = 0; i < vertices.length - 1; i++) {
                const dx = (vertices[i][0] - vertices[(i + 1) % (vertices.length - 1)][0]) * this.xScale;
                const dy = (vertices[i][1] - vertices[(i + 1) % (vertices.length - 1)][1]) * this.yScale;
                const vectorDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                sumLines += vectorDistance;
                lines.push(vectorDistance * this.quantity);
            }

            return {
                "ESTIMATE.ANNOTATION_VALUES.LENGTH": mathjs.multiply(sumLines, this.quantity).valueOf(),
                "ESTIMATE.ANNOTATION_VALUES.LENGTHS": lines,
            };
        }
        return undefined;
    }

    calculatePolygonWalls(vertices) {
        const lenghtData = this.calculatePolygonLenghts(vertices);
        return lenghtData["ESTIMATE.ANNOTATION_VALUES.LENGTHS"].map((len) => {
            return mathjs.chain(len).multiply(this.height).valueOf();
        });
    }

    calculatePolygonVolume(vertices) {
        if (vertices && this.height != undefined) {
            return mathjs.chain(this.calculatePolygonArea(vertices)).multiply(this.height).valueOf();
        }
        return undefined;
    }

    calculatePolygonSurfaceArea(vertices) {
        if (vertices && this.height != undefined) {
            return mathjs.chain(this.calculatePolygonLenghts(vertices)["ESTIMATE.ANNOTATION_VALUES.LENGTH"]).multiply(this.height).valueOf();
        }
        return undefined;
    }

    calculatePolygonPoints(vertices) {
        if (vertices && this.quantity != undefined) {
            return (vertices.length - 1) * this.quantity;
        }
        return undefined;
    }

    calculateOuterDimX(vertices) {
        let leftX = 0;
        let rightX = 0;
        if (vertices) {
            leftX = vertices[0][1];
            rightX = vertices[0][1];
            for (let i = 0; i < vertices.length - 1; i++) {
                if (leftX > vertices[i][1]) {
                    leftX = vertices[i][1];
                }
                if (rightX < vertices[i][1]) {
                    rightX = vertices[i][1];
                }
            }
        }

        return mathjs
            .chain(rightX - leftX)
            .multiply(this.xScale)
            .valueOf();
    }

    calculateOuterDimY(vertices) {
        let topY = 0;
        let bottomY = 0;
        if (vertices) {
            topY = vertices[0][0];
            bottomY = vertices[0][0];
            for (let i = 0; i < vertices.length - 1; i++) {
                if (topY > vertices[i][0]) {
                    topY = vertices[i][0];
                }
                if (bottomY < vertices[i][0]) {
                    bottomY = vertices[i][0];
                }
            }
        }

        return mathjs
            .chain(bottomY - topY)
            .multiply(this.yScale)
            .valueOf();
    }

    calculatePolygonValues(vertices) {
        const length = this.calculatePolygonLenghts(vertices);
        const area = this.calculatePolygonArea(vertices);
        const volume = this.calculatePolygonVolume(vertices);
        const wall = this.calculatePolygonSurfaceArea(vertices);
        return {
            "ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME": this.fileName,
            "ESTIMATE.ANNOTATION_VALUES.AREA": area,
            "ESTIMATE.ANNOTATION_VALUES.LENGTH": length["ESTIMATE.ANNOTATION_VALUES.LENGTH"],
            "ESTIMATE.ANNOTATION_VALUES.VOLUME": volume,
            "ESTIMATE.ANNOTATION_VALUES.WALL": wall,

            "ESTIMATE.ANNOTATION_VALUES.NET_AREA": area,
            "ESTIMATE.ANNOTATION_VALUES.NET_LENGTH": length["ESTIMATE.ANNOTATION_VALUES.LENGTH"],
            "ESTIMATE.ANNOTATION_VALUES.NET_VOLUME": volume,
            "ESTIMATE.ANNOTATION_VALUES.NET_WALL": wall,

            "ESTIMATE.ANNOTATION_VALUES.POINTS": this.calculatePolygonPoints(vertices),
            "ESTIMATE.ANNOTATION_PROPERTIES.COUNT": this.quantity,
            "ESTIMATE.ANNOTATION_PROPERTIES.HEIGHT": this.height,

            "ESTIMATE.ANNOTATION_VALUES.LENGTHS": length["ESTIMATE.ANNOTATION_VALUES.LENGTHS"],
            "ESTIMATE.ANNOTATION_VALUES.WALLS": this.calculatePolygonWalls(vertices),
            "ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X": this.calculateOuterDimX(vertices),
            "ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y": this.calculateOuterDimY(vertices),
        };
    }

    calculateFormulae(annotation) {
        if (annotation && annotation.get("annotationData")) {
            if (annotation.get("formulaNA")) {
                annotation = this.calculateValueFormula(annotation, "ESTIMATE.ANNOTATION_VALUES.NET_AREA", "formulaNA");
            }
            if (annotation.get("formulaNL")) {
                annotation = this.calculateValueFormula(annotation, "ESTIMATE.ANNOTATION_VALUES.NET_LENGTH", "formulaNL");
            }
            if (annotation.get("formulaNVO")) {
                annotation = this.calculateValueFormula(annotation, "ESTIMATE.ANNOTATION_VALUES.NET_VOLUME", "formulaNVO");
            }
            if (annotation.get("formulaNV")) {
                annotation = this.calculateValueFormula(annotation, "ESTIMATE.ANNOTATION_VALUES.NET_WALL", "formulaNV");
            }
        }
        return annotation;
    }

    calculateValueFormula(annotation, keyValue, keyFormula) {
        let annotationData = annotation.get("annotationData");
        const parseExpression =
            isNaN(annotation.get(keyFormula)) || annotation.get(keyFormula).includes("+") || annotation.get(keyFormula).includes("-")
                ? CalculationStore.parseExpressionToValues(annotationData.get(keyValue) + annotation.get(keyFormula), annotationData)
                : annotation.get(keyFormula);
        annotationData = annotationData.set(keyValue, parseExpression);
        return annotation.set("annotationData", annotationData);
    }

    // PolyLine
    calculateLineLength(vertices) {
        const lines = [];
        let sumLines = 0.0;
        if (vertices) {
            for (let i = 0; i < vertices.length - 1; i++) {
                const dx = (vertices[i][0] - vertices[i + 1][0]) * this.xScale;
                const dy = (vertices[i][1] - vertices[i + 1][1]) * this.yScale;
                const vectorDistance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                sumLines += vectorDistance;
                lines.push(vectorDistance * this.quantity);
            }

            return {
                "ESTIMATE.ANNOTATION_VALUES.LENGTH": mathjs.multiply(sumLines, this.quantity).valueOf(),
                "ESTIMATE.ANNOTATION_VALUES.LENGTHS": lines,
            };
        }
        return undefined;
    }

    calculateLineSurfaceArea(vertices) {
        if (vertices && this.height != undefined) {
            return mathjs.chain(this.calculateLineLength(vertices)["ESTIMATE.ANNOTATION_VALUES.LENGTH"]).multiply(this.height).valueOf();
        }
        return undefined;
    }

    calculateLineWalls(vertices) {
        const lenghtData = this.calculateLineLength(vertices);
        return lenghtData["ESTIMATE.ANNOTATION_VALUES.LENGTHS"].map((len) => {
            return mathjs.chain(len).multiply(this.height).valueOf();
        });
    }

    calculateLineValues(vertices) {
        const length = this.calculateLineLength(vertices);
        const wall = this.calculateLineSurfaceArea(vertices);
        return {
            "ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME": this.fileName,

            "ESTIMATE.ANNOTATION_VALUES.LENGTH": length["ESTIMATE.ANNOTATION_VALUES.LENGTH"],
            "ESTIMATE.ANNOTATION_VALUES.NET_LENGTH": length["ESTIMATE.ANNOTATION_VALUES.LENGTH"],

            "ESTIMATE.ANNOTATION_VALUES.WALL": wall,
            "ESTIMATE.ANNOTATION_VALUES.NET_WALL": wall,

            "ESTIMATE.ANNOTATION_VALUES.WALLS": this.calculateLineWalls(vertices),
            "ESTIMATE.ANNOTATION_VALUES.LENGTHS": length["ESTIMATE.ANNOTATION_VALUES.LENGTHS"],

            "ESTIMATE.ANNOTATION_VALUES.POINTS": this.calculateLinePoints(vertices),
            "ESTIMATE.ANNOTATION_PROPERTIES.COUNT": this.quantity,
            "ESTIMATE.ANNOTATION_PROPERTIES.HEIGHT": this.height,
        };
    }

    calculateLinePoints(vertices) {
        if (vertices && this.quantity != undefined) {
            return vertices.length * this.quantity;
        }
        return undefined;
    }

    // Ellipse
    calculateEllipseArea(rect) {
        if (rect && rect.length === 4) {
            const pointA = { x: rect[0], y: rect[1] };
            const pointB = { x: rect[2], y: rect[3] };
            const radiusX = mathjs.chain(pointA.x).subtract(pointB.x).divide(2.0).abs().multiply(this.xScale).valueOf();
            const radiusY = mathjs.chain(pointA.y).subtract(pointB.y).divide(2.0).abs().multiply(this.yScale).valueOf();

            return mathjs.chain(radiusX).multiply(radiusY).multiply(mathjs.pi.valueOf()).multiply(this.quantity).valueOf();
        }
        return undefined;
    }

    calculateEllipseCircumference(rect) {
        if (rect && rect.length === 4) {
            const pointA = { x: rect[0], y: rect[1] };
            const pointB = { x: rect[2], y: rect[3] };
            const radiusX = mathjs.chain(pointA.x).subtract(pointB.x).abs().multiply(this.xScale).divide(2.0).valueOf();
            const radiusY = mathjs.chain(pointA.y).subtract(pointB.y).abs().multiply(this.yScale).divide(2.0).valueOf();

            return mathjs.multiply(
                mathjs.evaluate("4 * (a+b) * (pi/4)^(4*a*b/((a+b)^2))", {
                    a: radiusX,
                    b: radiusY,
                }),
                this.quantity
            );
        }
        return undefined;
    }

    calculateEllipseVolume(rect) {
        return mathjs.chain(this.calculateEllipseArea(rect)).multiply(this.height).valueOf();
    }

    calculateEllipseSurfaceArea(rect) {
        return mathjs.chain(this.calculateEllipseCircumference(rect)).multiply(this.height).valueOf();
    }

    calculateEllipseValues(rect) {
        const radiusX = this.calculateEllipseRadiusX(rect);
        const radiusY = this.calculateEllipseRadiusY(rect);
        const area = this.calculateEllipseArea(rect);
        const volume = this.calculateEllipseVolume(rect);
        const wall = this.calculateEllipseSurfaceArea(rect);
        const length = this.calculateEllipseCircumference(rect);
        return {
            "ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME": this.fileName,

            "ESTIMATE.ANNOTATION_VALUES.AREA": area,
            "ESTIMATE.ANNOTATION_VALUES.LENGTH": this.calculateEllipseCircumference(rect),
            "ESTIMATE.ANNOTATION_VALUES.VOLUME": volume,
            "ESTIMATE.ANNOTATION_VALUES.WALL": wall,

            "ESTIMATE.ANNOTATION_VALUES.NET_AREA": area,
            "ESTIMATE.ANNOTATION_VALUES.NET_LENGTH": length,
            "ESTIMATE.ANNOTATION_VALUES.NET_VOLUME": volume,
            "ESTIMATE.ANNOTATION_VALUES.NET_WALL": wall,

            "ESTIMATE.ANNOTATION_VALUES.RADIUS_X": radiusX,
            "ESTIMATE.ANNOTATION_VALUES.RADIUS_Y": radiusY,
            "ESTIMATE.ANNOTATION_VALUES.DIAMETER_X": mathjs.chain(radiusX).multiply(2).valueOf(),
            "ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y": mathjs.chain(radiusY).multiply(2).valueOf(),

            "ESTIMATE.ANNOTATION_PROPERTIES.COUNT": this.quantity,
            "ESTIMATE.ANNOTATION_PROPERTIES.HEIGHT": this.height,
        };
    }

    calculateEllipseRadiusX(rect) {
        return mathjs.chain(rect[0]).subtract(rect[2]).divide(2.0).abs().multiply(this.xScale).valueOf();
    }

    calculateEllipseRadiusY(rect) {
        return mathjs.chain(rect[1]).subtract(rect[3]).divide(2.0).abs().multiply(this.yScale).valueOf();
    }

    calculateEllipseDiameterX(rect) {
        const radiusX = this.calculateEllipseRadiusX(rect);
        return mathjs.chain(radiusX).multiply(2).valueOf();
    }

    calculateEllipseDiameterY(rect) {
        const radiusY = this.calculateEllipseRadiusY(rect);
        return mathjs.chain(radiusY).multiply(2).valueOf();
    }

    calculateTilesForAnnotation(annotation, totalReductionLength = 0, reductionTiles = 0) {
        let annotationData = annotation.get("annotationData");

        if (annotation.has("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X") && annotation.has("annotationData")) {
            const tileX = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X");
            const tileY = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y");
            if (tileX && tileX > 0 && tileY && tileY > 0) {
                const selectedArea = annotationData.get("ESTIMATE.ANNOTATION_VALUES.NET_AREA");
                const o = annotationData.get("ESTIMATE.ANNOTATION_VALUES.LENGTH");
                const jointX = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X");
                const jointY = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y");
                const jointDepth = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH");
                const tileArea = (tileX * tileY) / (100 * 100);
                const t1 = selectedArea / tileArea;
                const jointLength = t1 * ((tileX + tileY) / 100) + o / 2 + totalReductionLength / 2;
                const jointArea = (jointLength / 2) * (jointX / 100) + (jointLength / 2) * (jointY / 100);
                const nrTiles = (selectedArea - jointArea) / tileArea + reductionTiles;
                const jointVolume = jointArea * jointDepth;
                annotationData = annotationData
                    .set("ESTIMATE.ANNOTATION_VALUES.AREA_TILES", nrTiles)
                    .set("ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_LENGTH", jointLength)
                    .set("ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_VOLUME", jointVolume);
                annotation = annotation.set("annotationData", annotationData);
            }
        }

        if (annotation.has("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X") && annotation.has("annotationData")) {
            const tileX = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X");
            const tileY = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y");
            if (tileX && tileX > 0 && tileY && tileY > 0) {
                const selectedWall = annotationData.get("ESTIMATE.ANNOTATION_VALUES.NET_WALL");
                const o = annotationData.get("ESTIMATE.ANNOTATION_VALUES.LENGTH");
                const jointX = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X");
                const jointY = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y");
                const jointDepth = annotation.get("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH");
                const tileWall = (tileX * tileY) / (100 * 100);
                const t1 = selectedWall / tileWall;
                const jointLength = t1 * ((tileX + tileY) / 100) + o / 2 + totalReductionLength / 2;
                const jointWall = (jointLength / 2) * (jointX / 100) + (jointLength / 2) * (jointY / 100);
                const nrTiles = (selectedWall - jointWall) / tileWall + reductionTiles;
                const jointVolume = jointWall * jointDepth;
                annotationData = annotationData
                    .set("ESTIMATE.ANNOTATION_VALUES.WALL_TILES", nrTiles)
                    .set("ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_LENGTH", jointLength)
                    .set("ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_VOLUME", jointVolume);
                annotation = annotation.set("annotationData", annotationData);
            }
        }
        return annotation;
    }

    getNextNumberString(inputString) {
        if (this.isNumber(inputString)) {
            const originalLength = inputString.length;
            let number = Number.parseInt(inputString);
            let intValue = number;
            return (++intValue).toString().padStart(originalLength, "0");
        } else {
            try {
                if (this.isNumber(inputString.charAt(inputString.length - 1))) {
                    return this.adjustNumeric(inputString);
                } else {
                    return this.adjustCharacters(inputString);
                }
            } catch (error) {
                console.log("erro calc: " + error.stack);
            }
        }
    }

    isNumber(inputString) {
        for (let i = 0; i < inputString.length; i++) {
            const charCode = inputString.charAt(i).charCodeAt(0);
            if (!(charCode >= 48 && charCode <= 57)) {
                return false;
            }
        }
        return true;
    }

    isLetter(charCode) {
        return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
    }

    adjustCharacters(inputString) {
        const inputArray = inputString.split("");
        let updated = false;
        for (let i = inputArray.length - 1; i >= 0; i--) {
            const charCode = inputArray[i].charCodeAt(0);
            if (this.isLetter(charCode)) {
                if ((charCode > 64 && charCode < 90) || (charCode > 96 && charCode < 122)) {
                    updated = true;
                    inputArray[i] = String.fromCharCode(charCode + 1);
                    break;
                } else {
                    if (inputArray[inputArray.length - 1].charCodeAt(0) <= 90) {
                        inputArray[i] = "A";
                    } else if (inputArray[inputArray.length - 1].charCodeAt(0) <= 122) {
                        inputArray[i] = "a";
                    }
                }
            } else {
                break;
            }
        }
        if (!updated) {
            if (inputArray[inputArray.length - 1].charCodeAt(0) <= 90) {
                inputArray.push("A");
            } else if (inputArray[inputArray.length - 1].charCodeAt(0) <= 122) {
                inputArray.push("a");
            }
        }
        return inputArray.join("");
    }

    adjustNumeric(inputString) {
        const inputArray = inputString.split("");
        const charCode = inputArray[inputArray.length - 1].charCodeAt(0);
        if (charCode < 57) {
            // 9
            // just increase
            inputArray[inputArray.length - 1] = String.fromCharCode(charCode + 1);
            return inputArray.join("");
        } else {
            const startIndex = this.getNumberIndexFromLeft(inputArray);
            const slicedNumber = inputString.slice(-(inputString.length - startIndex));
            const originalLength = slicedNumber.length;
            const slicedText = inputString.slice(0, startIndex);
            let intValue = Number.parseInt(slicedNumber);
            return slicedText + (++intValue).toString().padStart(originalLength, "0");
        }
    }

    getNumberIndexFromLeft(inputArray) {
        for (let i = inputArray.length - 1; i >= 0; i--) {
            if (!this.isNumber(inputArray[i])) {
                return i + 1;
            }
        }
        return 0;
    }
}
