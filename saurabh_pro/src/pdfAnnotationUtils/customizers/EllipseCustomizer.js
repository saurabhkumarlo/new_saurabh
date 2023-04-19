import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";

export default class EllipseCustomIzer {
    init(window, calculator) {
        const ellipseSerialize = window.Annotations.EllipseAnnotation.prototype.serialize;
        window.Annotations.EllipseAnnotation.prototype.serialize = function (element, pageMatrix) {
            let el = ellipseSerialize.call(this, element, pageMatrix);
            el.setAttribute("Hidden", this.Hidden);
            el.setAttribute("formulaNA", this.formulaNA);
            el.setAttribute("formulaNL", this.formulaNL);
            el.setAttribute("formulaNVO", this.formulaNVO);
            el.setAttribute("formulaNV", this.formulaNV);
            el.setAttribute("maintainAspectRatio", this.MaintainAspectRatio);
            el.setAttribute("readOnly", this.ReadOnly);

            return el;
        };

        const ellipseDeserialize = window.Annotations.EllipseAnnotation.prototype.deserialize;
        window.Annotations.EllipseAnnotation.prototype.deserialize = function (el, pageMatrix) {
            ellipseDeserialize.call(this, el, pageMatrix);
            this.Hidden = el.getAttribute("Hidden") === "true";
            this.currentFontSize = calculator.getFontSize(this);
            this.formulaNA = el.hasAttribute("formulaNA") ? el.getAttribute("formulaNA") : "";
            this.formulaNL = el.hasAttribute("formulaNL") ? el.getAttribute("formulaNL") : "";
            this.formulaNVO = el.hasAttribute("formulaNVO") ? el.getAttribute("formulaNVO") : "";
            this.formulaNV = el.hasAttribute("formulaNV") ? el.getAttribute("formulaNV") : "";
            this.MaintainAspectRatio = el.getAttribute("maintainAspectRatio") === "true";
            this.ReadOnly = el.getAttribute("readOnly") === "true";
        };

        const ellipseDraw = window.Annotations.EllipseAnnotation.prototype.draw;
        window.Annotations.EllipseAnnotation.prototype.draw = function (ctx) {
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

            ellipseDraw.apply(this, arguments);
            ctx.restore();
            let rotation = window.docViewer.getCompleteRotation(window.docViewer.getCurrentPage());
            rotation = (-90 * rotation * Math.PI) / 180;
            ctx.save();
            if (this.newAnnotation) {
                this.currentFontSize = calculator.getFontSize(this);
                ctx.font = this.currentFontSize + calculator.GEOMETRA_FONT_TYPE;
            } else if (this.currentFontSize) {
                ctx.font = this.currentFontSize + calculator.GEOMETRA_FONT_TYPE;
            }
            ctx.fillStyle = calculator.GEOMETRA_TEXT_FILL_STYLE;
            calculator.buildOrDrawEllipseData(this, ctx, rotation);
            ctx.restore();
        };
    }
}
