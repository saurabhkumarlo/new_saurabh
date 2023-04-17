import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";

export default class PolygonCustomizer {
    init(initialIzer, window, calculator) {
        const polygonSerialize = window.Annotations.PolygonAnnotation.prototype.serialize;
        window.Annotations.PolygonAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = polygonSerialize.call(this, element, pageMatrix);

            el.setAttribute("Hidden", this.Hidden);
            el.setAttribute("formulaNA", this.formulaNA);
            el.setAttribute("formulaNL", this.formulaNL);
            el.setAttribute("formulaNVO", this.formulaNVO);
            el.setAttribute("formulaNV", this.formulaNV);
            el.setAttribute("readOnly", this.ReadOnly);
            return el;
        };

        const polygonDeserialize = window.Annotations.PolygonAnnotation.prototype.deserialize;
        window.Annotations.PolygonAnnotation.prototype.deserialize = function (el, pageMatrix) {
            polygonDeserialize.call(this, el, pageMatrix);

            this.Hidden = el.getAttribute("Hidden") === "true";
            this.currentFontSize = calculator.getFontSize(this);
            this.formulaNA = el.hasAttribute("formulaNA") ? el.getAttribute("formulaNA") : "";
            this.formulaNL = el.hasAttribute("formulaNL") ? el.getAttribute("formulaNL") : "";
            this.formulaNVO = el.hasAttribute("formulaNVO") ? el.getAttribute("formulaNVO") : "";
            this.formulaNV = el.hasAttribute("formulaNV") ? el.getAttribute("formulaNV") : "";
            this.ReadOnly = el.getAttribute("readOnly") === "true";
        };

        const polygonDraw = window.Annotations.PolygonAnnotation.prototype.draw;

        window.Annotations.PolygonAnnotation.prototype.draw = function (ctx) {
            ctx.save();
            ctx.lineCap = "butt";

            switch (this.Style) {
                case "dashed":
                    ctx.setLineDash(DASHED_LINE_PATTERN);
                    break;
                case "dotted":
                    ctx.setLineDash(DOTTED_LINE_PATTERN);
                    break;
                case "dot-dash-dot":
                    ctx.setLineDash(DOT_DASH_DOT_LINE_PATTERN);
                    break;
                default:
                    break;
            }

            polygonDraw.apply(this, arguments);
            ctx.restore();
            let rotation = window.docViewer.getCompleteRotation(window.docViewer.getCurrentPage());
            rotation = (-90 * rotation * Math.PI) / 180;
            ctx.save();
            if (this.newAnnotation) {
                this.currentFontSize = calculator.getFontSize(this) + calculator.GEOMETRA_FONT_TYPE;
                ctx.font = this.currentFontSize;
            } else if (this.currentFontSize) {
                ctx.font = this.currentFontSize + calculator.GEOMETRA_FONT_TYPE;
            }
            ctx.fillStyle = calculator.GEOMETRA_TEXT_FILL_STYLE;
            calculator.buildOrDrawPolygonData(this, ctx, rotation, /*initializer.customGeometraUtilsObject.i18n*/ undefined);
            ctx.restore();
            if (this.getPath().length === 2 && this.newAnnotation) {
                ctx.save();
                ctx.setLineDash([0.45]);
                ctx.strokeStyle = "rgba(90,177,74,0.7)";
                ctx.lineWidth = 0.35;
                const firstPoint = this.getPathPoint(0);
                const secondPoint = this.getPathPoint(1);
                ctx.beginPath();
                ctx.moveTo(firstPoint.x, firstPoint.y);
                ctx.lineTo(secondPoint.x, firstPoint.y);
                ctx.lineTo(secondPoint.x, secondPoint.y);
                ctx.lineTo(firstPoint.x, secondPoint.y);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
            if (initialIzer.isSnaponEnabled() && this.snapGuidePoint && this.snapPoint) {
                const firstPoint = this.snapPoint;
                const secondPoint = this.snapGuidePoint;

                ctx.save();
                ctx.setLineDash([0.2]);
                ctx.lineWidth = 0.45;
                ctx.strokeStyle = "rgba(90,177,74,0.9)";
                ctx.beginPath();
                ctx.moveTo(firstPoint.x, firstPoint.y);
                ctx.lineTo(secondPoint.x, secondPoint.y);
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.strokeStyle = "rgba(90,177,74,1.0)";
                ctx.lineWidth = 0.25;
                ctx.beginPath();
                ctx.moveTo(firstPoint.x, firstPoint.y);
                ctx.moveTo(firstPoint.x - 1.5, firstPoint.y - 1.5);
                ctx.lineTo(firstPoint.x + 1.5, firstPoint.y - 1.5);
                ctx.lineTo(firstPoint.x + 1.5, firstPoint.y + 1.5);
                ctx.lineTo(firstPoint.x - 1.5, firstPoint.y + 1.5);
                ctx.lineTo(firstPoint.x - 1.5, firstPoint.y - 1.5);
                ctx.stroke();
                ctx.restore();
            }
        };
    }
}
