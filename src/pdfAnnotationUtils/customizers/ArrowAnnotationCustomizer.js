import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";

export default class ArrowAnnotationCustomizer {
    init(window, calculator) {
        window.Annotations.LineSelectionModel.prototype.drawSelectionOutline = function () {};
        const arrowSerialize = window.Annotations.LineAnnotation.prototype.serialize;

        window.Annotations.LineAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = arrowSerialize.call(this, element, pageMatrix);
            el.setAttribute("Hidden", this.Hidden);
            return el;
        };

        const arrowDeserialize = window.Annotations.LineAnnotation.prototype.deserialize;

        window.Annotations.LineAnnotation.prototype.deserialize = function (el, pageMatrix) {
            arrowDeserialize.call(this, el, pageMatrix);
            this.Hidden = el.getAttribute("Hidden") === "true";
        };

        const arrowDraw = window.Annotations.LineAnnotation.prototype.draw;

        window.Annotations.LineAnnotation.prototype.draw = function (ctx) {
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

            arrowDraw.apply(this, arguments);
            ctx.restore();
            ctx.save();
        };
    }
}
