import StandardValueInheritance from "./StandardAnnotationValueInheritance";

export default class PointValueInheritance extends StandardValueInheritance {
    constructor({ number, interiorColor, name, height, labels, pointSize, iconType, geometraOpacity }) {
        super({ number, name, height, labels, geometraOpacity });
        this.pointSize = pointSize;
        this.iconType = iconType;
        this.rotation = 0;
        this.interiorColor = interiorColor;
    }

    getPointSize() {
        return this.pointSize || 10;
    }

    getInteriorColor() {
        return this.interiorColor;
    }

    setPointSize(pointSize) {
        this.pointSize = pointSize;
    }

    getGeometraBorderOpacity() {
        return this.geometraOpacity;
    }

    getIconType() {
        return this.iconType || "none";
    }

    setIconType(iconType) {
        this.iconType = iconType;
    }

    getRotation() {
        return this.rotation;
    }

    setRotation(rotation) {
        this.rotation = rotation;
    }
}
