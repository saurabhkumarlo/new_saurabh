import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";

import hexToRGB from "../../utils/HexToRGB";

export default class FreeHandCustomizer {
    init(initializer, window, calculator) {
        const freeHandDraw = window.Annotations.FreeHandAnnotation.prototype.draw;

        window.Annotations.FreeHandAnnotation.prototype.draw = function (ctx) {
            ctx.save();

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

            freeHandDraw.apply(this, arguments);
            ctx.restore();
            let rotation = window.docViewer.getCompleteRotation(window.docViewer.getCurrentPage());
            rotation = (-90 * rotation * Math.PI) / 180;
            ctx.save();
            ctx.fillStyle = this.FillColor.toString();

            ctx.fill();
            ctx.restore();
            ctx.save();
            if (this.currentFontSize) {
                ctx.font = this.currentFontSize + calculator.GEOMETRA_FONT_TYPE;
            }
            ctx.fillStyle = calculator.GEOMETRA_TEXT_FILL_STYLE;
            calculator.buildOrDrawPolygonData(this, ctx, rotation);
            ctx.restore();
            if (initializer.isSnaponEnabled() && this.snapGuidePoint && this.snapPoint) {
                ctx.save();
                ctx.setLineDash([0.3]);
                ctx.lineWidth = "0.45";
                ctx.strokeStyle = "rgba(90,177,74,0.8)";
                ctx.beginPath();
                ctx.moveTo(this.snapGuidePoint.x, this.snapGuidePoint.y);
                ctx.lineTo(this.snapPoint.x, this.snapPoint.y);
                ctx.stroke();
                ctx.restore();
            }
        };

        const freeHandDeserialize = window.Annotations.FreeHandAnnotation.prototype.deserialize;
        window.Annotations.FreeHandAnnotation.prototype.deserialize = function (el, pageMatrix) {
            freeHandDeserialize.call(this, el, pageMatrix);
            if (!this.FillColor) {
                const rgb = hexToRGB(el.getAttribute("interior-color"));

                this.FillColor = new window.Annotations.Color();
                this.FillColor.R = rgb.r;
                this.FillColor.G = rgb.g;
                this.FillColor.B = rgb.b;
                this.FillColor.A = 1;
            }
            this.Hidden = el.getAttribute("Hidden") === "true";
            this.currentFontSize = calculator.getFontSize(this);
            this.formulaNA = el.hasAttribute("formulaNA") ? el.getAttribute("formulaNA") : "";
            this.formulaNL = el.hasAttribute("formulaNL") ? el.getAttribute("formulaNL") : "";
            this.formulaNVO = el.hasAttribute("formulaNVO") ? el.getAttribute("formulaNVO") : "";
            this.formulaNV = el.hasAttribute("formulaNV") ? el.getAttribute("formulaNV") : "";
            this.MaintainAspectRatio = el.getAttribute("maintainAspectRatio") === "true";
            this.ReadOnly = el.getAttribute("readOnly") === "true";
        };

        const freeHandSerialize = window.Annotations.FreeHandAnnotation.prototype.serialize;
        window.Annotations.FreeHandAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = freeHandSerialize.call(this, element, pageMatrix);
            el.setAttribute("Hidden", this.Hidden);
            el.setAttribute("formulaNA", this.formulaNA);
            el.setAttribute("formulaNL", this.formulaNL);
            el.setAttribute("formulaNVO", this.formulaNVO);
            el.setAttribute("formulaNV", this.formulaNV);
            el.setAttribute("maintainAspectRatio", this.MaintainAspectRatio);
            el.setAttribute("readOnly", this.ReadOnly);

            return el;
        };
    }
}
