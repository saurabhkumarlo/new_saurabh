import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";

export default class PolylineCustomizer {
    constructor() {
        this.calculator = undefined;
    }

    init(initializer, window, calculator) {
        const polylineSerialize = window.Annotations.PolylineAnnotation.prototype.serialize;
        window.Annotations.PolylineAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = polylineSerialize.call(this, element, pageMatrix);
            if (this.Subject === "x-scale" || this.Subject === "y-scale") {
                el.setAttribute("width", this.width);
            } else {
                el.setAttribute("formulaNL", this.formulaNL);
                el.setAttribute("formulaNV", this.formulaNV);
            }
            el.setAttribute("geometraOpacity", this.geometraOpacity || 1);
            el.setAttribute("readOnly", this.ReadOnly);
            el.setAttribute("Hidden", this.Hidden);
            el.setAttribute("style", this.style || "solid");
            return el;
        };

        const polylineDeserialize = window.Annotations.PolylineAnnotation.prototype.deserialize;
        window.Annotations.PolylineAnnotation.prototype.deserialize = function (el, pageMatrix) {
            if (this.newScale) {
                this.newScale = false;
            }
            polylineDeserialize.call(this, el, pageMatrix);
            if (this.Subject === "x-scale" || this.Subject === "y-scale") {
                this.width = el.getAttribute("width") ? el.getAttribute("width") : el.getAttribute("strokeSize") ? el.getAttribute("strokeSize") : 1;
            } else {
                this.formulaNL = el.hasAttribute("formulaNL") ? el.getAttribute("formulaNL") : "";
                this.formulaNV = el.hasAttribute("formulaNV") ? el.getAttribute("formulaNV") : "";
            }
            this.currentFontSize = calculator.getFontSize(this);
            this.ReadOnly = el.getAttribute("readOnly") === "true";
            this.Hidden = el.getAttribute("Hidden") === "true";
            this.style = el.getAttribute("style") ? el.getAttribute("style") : "";
            const opacity = parseFloat(
                el.getAttribute("geometraBorderOpacity") && el.getAttribute("geometraBorderOpacity") !== "undefined"
                    ? el.getAttribute("geometraBorderOpacity")
                    : el.getAttribute("geometraOpacity")
            );
            if (!Number.isNaN(opacity)) {
                this.geometraBorderOpacity = opacity;
            } else {
                this.geometraBorderOpacity = 1;
            }
        };

        const polylineDraw = window.Annotations.PolylineAnnotation.prototype.draw;

        window.Annotations.PolylineAnnotation.prototype.draw = function (ctx) {
            ctx.save();
            ctx.lineCap = "butt";
            ctx.strokeStyle = "rgba(0, 0, 255, 1)";

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

            polylineDraw.apply(this, arguments);
            ctx.restore();
            let rotation = window.docViewer.getCompleteRotation(window.docViewer.getCurrentPage());
            rotation = (-90 * rotation * Math.PI) / 180;
            const newScale = this.newScale;
            ctx.save();
            if (this.newAnnotation) {
                this.currentFontSize = calculator.getFontSize(this) + calculator.GEOMETRA_FONT_TYPE;
                ctx.font = this.currentFontSize;
            } else if (this.currentFontSize) {
                ctx.font = this.currentFontSize + calculator.GEOMETRA_FONT_TYPE;
            }
            ctx.fillStyle = calculator.GEOMETRA_TEXT_FILL_STYLE;

            calculator.buildOrDrawPolylineData(this, ctx, rotation);
            ctx.restore();
            if (!newScale) {
                calculator.drawArrows(ctx, this);
            }
            if (initializer.isSnaponEnabled() && this.snapGuidePoint && this.snapPoint) {
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
