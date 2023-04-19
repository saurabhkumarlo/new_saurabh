import GeometricCalculation from "./GeometricCalculation";

export default class StandardAnnotationValueInheritance {
    constructor({
        number,
        color,
        name,
        height,
        interiorColor,
        lineSize = 0,
        width,
        labels,
        geometraOpacity,
        geometraBorderOpacity,
        style,
        strokeColor,
        fontSize,
        decoration,
        maintainAspectRatio,
        areaTilesX,
        areaTilesY,
        areaJointX,
        areaJointY,
        areaJointDepth,
        wallTilesX,
        wallTilesY,
        wallJointX,
        wallJointY,
        wallJointDepth,
    }) {
        this.number = number;
        this.color = color || "#F5B200";
        this.interiorColor = interiorColor || "#00CF83";
        this.name = name;
        this.height = height;
        this.labels = labels || null;
        this.geometraOpacity = geometraOpacity || 0.6;
        this.geometraBorderOpacity = geometraBorderOpacity || 0.8;
        this.style = style || "solid";
        this.width = width || 1;
        this.lineSize = lineSize;
        this.strokeColor = strokeColor || "#f1c232";
        this.fontSize = fontSize || 12;
        this.decoration = decoration;
        this.maintainAspectRatio = maintainAspectRatio || true;
        this.areaTilesX = areaTilesX || "";
        this.areaTilesY = areaTilesY || "";
        this.areaJointX = areaJointX || "";
        this.areaJointY = areaJointY || "";
        this.areaJointDepth = areaJointDepth || "";
        this.wallTilesX = wallTilesX || "";
        this.wallTilesY = wallTilesY || "";
        this.wallJointX = wallJointX || "";
        this.wallJointY = wallJointY || "";
        this.wallJointDepth = wallJointDepth || "";
    }

    getNumber() {
        if (this.number) {
            const calculator = new GeometricCalculation();
            this.number = calculator.getNextNumberString(this.number);
        }
        return this.number;
    }

    getTiles() {
        return {
            areaTilesX: this.areaTilesX,
            areaTilesY: this.areaTilesY,
            areaJointX: this.areaJointX,
            areaJointY: this.areaJointY,
            areaJointDepth: this.areaJointDepth,
            wallTilesX: this.wallTilesX,
            wallTilesY: this.wallTilesY,
            wallJointX: this.wallJointX,
            wallJointY: this.wallJointY,
            wallJointDepth: this.wallJointDepth,
        };
    }

    getColor() {
        return this.color;
    }

    getMaintainAspectRatio() {
        return this.maintainAspectRatio;
    }

    getInteriorColor() {
        return this.interiorColor;
    }

    getName() {
        return this.name;
    }

    getHeight() {
        return this.height;
    }

    getGeometraOpacity() {
        return this.geometraOpacity;
    }

    getLabels() {
        return this.labels;
    }

    getGeometraBorderOpacity() {
        return this.geometraBorderOpacity;
    }

    getLineSize() {
        return this.lineSize;
    }

    getWidth() {
        return this.width;
    }

    getStyle() {
        return this.style;
    }

    getStrokeColor() {
        return this.strokeColor;
    }

    getFontSize() {
        return this.fontSize;
    }

    getDecoration() {
        return this.decoration;
    }

    setLineSize(lineSize) {
        return (this.lineSize = lineSize);
    }

    setNumber(number) {
        this.number = number;
    }

    setColor(color) {
        this.color = color;
    }

    setInteriorColor(color) {
        this.interiorColor = color;
    }

    setName(name) {
        this.name = name;
    }

    setHeight(height) {
        this.height = height;
    }

    setGeometraOpacity(geometraOpacity) {
        this.geometraOpacity = geometraOpacity;
    }

    setGeometraBorderOpacity(geometraBorderOpacity) {
        this.geometraBorderOpacity = geometraBorderOpacity;
    }
}
