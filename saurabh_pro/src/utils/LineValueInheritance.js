import StandardValueInheritance from "./StandardAnnotationValueInheritance";

export default class ExtendedValueInheritance extends StandardValueInheritance {
    constructor({
        number,
        color,
        name,
        height,
        lineSize,
        labels,
        geometraOpacity,
        geometraLineStart,
        geometraLineEnd,
        style,
        width,
        wallTilesX,
        wallTilesY,
        wallJointX,
        wallJointY,
        wallJointDepth,
    }) {
        super({ number, color, name, height, labels, lineSize, style, width, wallTilesX, wallTilesY, wallJointX, wallJointY, wallJointDepth });

        this.color = color || "#0AB1E1";
        this.geometraLineStart = geometraLineStart || "-";
        this.geometraLineEnd = geometraLineEnd || "-";
        this.geometraOpacity = geometraOpacity || 0.6;
    }

    getGeometraOpacity() {
        return this.geometraOpacity;
    }

    getGeometraLineStart() {
        return this.geometraLineStart;
    }

    setGeometraLineStart(start) {
        this.geometraLineStart = start;
    }

    getGeometraLineEnd() {
        return this.geometraLineEnd;
    }

    setGeometraLineEnd(end) {
        this.geometraLineEnd = end;
    }
}
