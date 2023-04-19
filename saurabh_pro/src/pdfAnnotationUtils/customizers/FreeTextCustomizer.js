import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";
import hexToRGB from "../../utils/HexToRGB";

export default class FreeTextCustomizer {
    init(window) {
        const freeTextDraw = window.Annotations.FreeTextAnnotation.prototype.draw;

        window.Annotations.FreeTextAnnotation.prototype.draw = function (ctx) {
            ctx.restore();
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

            ctx.save();
            ctx.restore();
            let rotation = window.docViewer.getCompleteRotation(window.docViewer.getCurrentPage());
            rotation = (-90 * rotation * Math.PI) / 180;

            if (this.strokeColor) {
                const rgb = hexToRGB(this.strokeColor);
                this.Color.R = rgb.r;
                this.Color.G = rgb.g;
                this.Color.B = rgb.b;
            }

            this.Color.A = this.Subject === "Free Text" ? this.geometraBorderOpacity : 0;
            ctx.save();
            ctx.restore();

            ctx.strokeStyle = this.Color;

            ctx.save();
            ctx.restore();

            freeTextDraw.apply(this, arguments);
        };

        const freeTextSerialize = window.Annotations.FreeTextAnnotation.prototype.serialize;
        window.Annotations.FreeTextAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = freeTextSerialize.call(this, element, pageMatrix);
            el.setAttribute("Hidden", this.Hidden);
            el.setAttribute("fontSize", this.FontSize);
            el.setAttribute("textFont", this.textFont);
            return el;
        };

        const freeTextDeserialize = window.Annotations.FreeTextAnnotation.prototype.deserialize;
        window.Annotations.FreeTextAnnotation.prototype.deserialize = function (el, pageMatrix) {
            freeTextDeserialize.call(this, el, pageMatrix);
            this.Hidden = el.getAttribute("Hidden") === "true";
            this.FontSize = `${el.getAttribute("fontSize")}px`;
        };
    }
}
