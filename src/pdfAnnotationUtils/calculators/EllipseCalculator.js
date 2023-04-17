import { LABELS } from "constants/LabelsConstants";
import GeometricCalculation from "utils/GeometricCalculation";
import AnnotationStore from "../../stores/AnnotationStore";
import PointCalculator from "./PointCalculator";

export default class EllipseCalculator extends PointCalculator {
    buildOrDrawEllipseData(annotation, ctx, rotation) {
        const labels = annotation.labels;
        const activeLabels = labels?.active;
        const styles = labels?.centralStyles;

        if (activeLabels && activeLabels.length > 0) {
            const scaleData = AnnotationStore.getScaleForPDFAnnotation(annotation);
            let calculator;
            if (scaleData && scaleData.get("x-scale"))
                calculator = new GeometricCalculation(annotation.annotationHeight, 1, scaleData.get("x-scale"), annotation.geoFileId, scaleData.get("y-scale"));

            const centerTextToShow = this.getEllipseLabels(annotation, activeLabels, calculator);
            if (centerTextToShow.length) this.drawCentralLabels(ctx, centerTextToShow, styles, annotation, rotation);
        }
    }

    getEllipseLabels(annotation, activeLabels, calculator) {
        const isScale = this.getScale(annotation.PageNumber);
        const centerTextToShow = [];
        const rect = annotation.getRect();
        const calcRect = [rect.x1, rect.y1, rect.x2, rect.y2];

        if (activeLabels.includes(LABELS.NR_TAG)) centerTextToShow.push("[" + annotation.annotationNumber + "]");
        if (activeLabels.includes(LABELS.NAME)) centerTextToShow.push(annotation.annotationName);
        if (activeLabels.includes(LABELS.VARIABLES) && isScale) {
            if (activeLabels.includes(LABELS.AREA))
                centerTextToShow.push("A: " + this.getValueToDisplay(this.calculateEllipseArea(rect, annotation.getPageNumber()), "m2"));
            else centerTextToShow.push("A");

            if (activeLabels.includes(LABELS.VOLUME))
                centerTextToShow.push(
                    "(VO:" + this.getValueToDisplay(this.calculateEllipseArea(rect, annotation.getPageNumber()) * annotation.annotationHeight, "m3") + ")"
                );
            else centerTextToShow.push("(VO)");

            if (activeLabels.includes(LABELS.LENGTH))
                centerTextToShow.push("L: " + this.getValueToDisplay(this.calculateEllipseCircumference(rect, annotation.getPageNumber()), "m"));
            else centerTextToShow.push("L");

            if (activeLabels.includes(LABELS.WALL))
                centerTextToShow.push(
                    "V:" + this.getValueToDisplay(this.calculateEllipseCircumference(rect, annotation.getPageNumber()) * annotation.annotationHeight, "m2")
                );
            else centerTextToShow.push("(V)");

            if (activeLabels.includes(LABELS.NET_AREA))
                centerTextToShow.push("NA: " + this.getValueToDisplay(this.calculateEllipseNetArea(annotation, annotation.PageNumber), "m2"));
            else centerTextToShow.push("NA");

            if (activeLabels.includes(LABELS.NET_VOLUME))
                centerTextToShow.push("(NVO:" + this.getValueToDisplay(this.calculateEllipseNetVolume(annotation, annotation.getPageNumber()), "m3") + ")");
            else centerTextToShow.push("(NVO)");

            if (activeLabels.includes(LABELS.NET_LENGTH))
                centerTextToShow.push("NL: " + this.getValueToDisplay(this.calculateEllipseNetCircumfernece(annotation, annotation.getPageNumber()), "m"));
            else centerTextToShow.push("NL");

            if (activeLabels.includes(LABELS.NET_WALL))
                centerTextToShow.push("NV: " + this.getValueToDisplay(this.calculateEllipseNetWall(annotation, annotation.getPageNumber()), "m2"));
            else centerTextToShow.push("NV");

            if (activeLabels.includes(LABELS.RADIUS_X) && calculator)
                centerTextToShow.push("RX: " + this.getValueToDisplay(calculator.calculateEllipseRadiusX(calcRect), "m"));
            else centerTextToShow.push("RX");

            if (activeLabels.includes(LABELS.RADIUS_Y) && calculator)
                centerTextToShow.push("RY: " + this.getValueToDisplay(calculator.calculateEllipseRadiusY(calcRect), "m"));
            else centerTextToShow.push("RY");

            if (activeLabels.includes(LABELS.DIAMETER_X) && calculator)
                centerTextToShow.push("DX: " + this.getValueToDisplay(calculator.calculateEllipseDiameterX(calcRect), "m"));
            else centerTextToShow.push("DX");

            if (activeLabels.includes(LABELS.DIAMETER_Y) && calculator)
                centerTextToShow.push("DY: " + this.getValueToDisplay(calculator.calculateEllipseDiameterY(calcRect), "m"));
            else centerTextToShow.push("DY");
        } else if (isScale) {
            if (activeLabels.includes(LABELS.AREA))
                centerTextToShow.push("" + this.getValueToDisplay(this.calculateEllipseArea(rect, annotation.getPageNumber()), "m2"));

            if (activeLabels.includes(LABELS.LENGTH))
                centerTextToShow.push(this.getValueToDisplay(this.calculateEllipseCircumference(rect, annotation.getPageNumber()), "m"));

            if (activeLabels.includes(LABELS.VOLUME))
                centerTextToShow.push(
                    "(" + this.getValueToDisplay(this.calculateEllipseArea(rect, annotation.getPageNumber()) * annotation.annotationHeight, "m3") + ")"
                );

            if (activeLabels.includes(LABELS.WALL))
                centerTextToShow.push(
                    "" + this.getValueToDisplay(this.calculateEllipseCircumference(rect, annotation.getPageNumber()) * annotation.annotationHeight, "m2")
                );

            if (activeLabels.includes(LABELS.NET_AREA))
                centerTextToShow.push(this.getValueToDisplay(this.calculateEllipseNetArea(annotation, annotation.PageNumber), "m2"));

            if (activeLabels.includes(LABELS.NET_LENGTH))
                centerTextToShow.push(this.getValueToDisplay(this.calculateEllipseNetCircumfernece(annotation, annotation.getPageNumber()), "m"));

            if (activeLabels.includes(LABELS.NET_VOLUME))
                centerTextToShow.push("(" + this.getValueToDisplay(this.calculateEllipseNetVolume(annotation, annotation.getPageNumber()), "m3") + ")");

            if (activeLabels.includes(LABELS.NET_WALL))
                centerTextToShow.push("(" + this.getValueToDisplay(this.calculateEllipseNetWall(annotation, annotation.getPageNumber()), "m2") + ")");

            if (activeLabels.includes(LABELS.RADIUS_X) && calculator)
                centerTextToShow.push(this.getValueToDisplay(calculator.calculateEllipseRadiusX(calcRect), "m"));

            if (activeLabels.includes(LABELS.RADIUS_Y) && calculator)
                centerTextToShow.push(this.getValueToDisplay(calculator.calculateEllipseRadiusY(calcRect), "m"));

            if (activeLabels.includes(LABELS.DIAMETER_X) && calculator)
                centerTextToShow.push(this.getValueToDisplay(calculator.calculateEllipseDiameterX(calcRect), "m"));

            if (activeLabels.includes(LABELS.DIAMETER_Y) && calculator)
                centerTextToShow.push(this.getValueToDisplay(calculator.calculateEllipseDiameterY(calcRect), "m"));
        }
        return centerTextToShow;
    }

    calculateEllipseArea(rect, pageNumber) {
        if (rect && rect.getWidth() > 0 && rect.getHeight() > 0) {
            const scaleValue = this.getScaleValue(pageNumber);
            const radiusX = rect.getWidth() * 0.5 * scaleValue.xScaleValue;
            const radiusY = rect.getHeight() * 0.5 * scaleValue.yScaleValue;
            return Math.PI * radiusX * radiusY;
        }
        return -1;
    }

    calculateEllipseCircumference(rect, pageNumber) {
        if (rect && rect.getWidth() > 0 && rect.getHeight() > 0) {
            const scaleValue = this.getScaleValue(pageNumber);
            const radiusX = rect.getWidth() * 0.5 * scaleValue.xScaleValue;
            const radiusY = rect.getHeight() * 0.5 * scaleValue.yScaleValue;
            return 4 * (radiusX + radiusY) * Math.pow(Math.PI / 4, (4 * radiusX * radiusY) / Math.pow(radiusX + radiusY, 2));
        }
        return -1;
    }

    calculateEllipseNetCircumfernece(annotation, pageNumber) {
        let netLength = undefined;
        if (annotation.formulaNL) {
            netLength = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNL, "ESTIMATE.ANNOTATION_VALUES.LENGTH");
            return netLength;
        }
        netLength = this.calculateEllipseCircumference(annotation.getRect(), pageNumber);
        return netLength;
    }

    calculateEllipseNetArea(annotation, pageNumber) {
        let netArea = undefined;
        if (annotation.formulaNA) {
            netArea = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNA, "ESTIMATE.ANNOTATION_VALUES.AREA");
            return netArea;
        }
        netArea = this.calculateEllipseArea(annotation.getRect(), pageNumber);
        return netArea;
    }

    calculateEllipseNetWall(annotation, pageNumber) {
        let netWall = undefined;
        if (annotation.formulaNV) {
            netWall = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNV, "ESTIMATE.ANNOTATION_VALUES.WALL");
            return netWall;
        }
        netWall = this.calculateEllipseCircumference(annotation.getRect(), annotation.PageNumber) * annotation.annotationHeight;
        return netWall;
    }

    calculateEllipseNetVolume(annotation, pageNumber) {
        let netVolume = undefined;
        if (annotation.formulaNVO) {
            netVolume = AnnotationStore.parseFormulaFromConfig(annotation, annotation.formulaNVO, "ESTIMATE.ANNOTATION_VALUES.VOLUME");
            return netVolume;
        }
        netVolume = this.calculateEllipseArea(annotation.getRect(), pageNumber) * annotation.annotationHeight;
        return netVolume;
    }
}
