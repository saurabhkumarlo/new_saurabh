import { DASHED_LINE_PATTERN, DOTTED_LINE_PATTERN, DOT_DASH_DOT_LINE_PATTERN } from "../../constants/PDFPatternConstants";

export default class StampCustomizer {
    init(window) {
        const stampAnnotationSerialize = window.Annotations.StampAnnotation.prototype.serialize;
        window.Annotations.StampAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = stampAnnotationSerialize.call(this, element, pageMatrix);
            el.setAttribute("rotation", this.Rotation);
            el.setAttribute("maintainAspectRatio", this.MaintainAspectRatio);
            el.setAttribute("readOnly", this.ReadOnly);
            el.setAttribute("Hidden", this.Hidden);
            el.setAttribute("style", this.Style);

            return el;
        };

        const stampAnnotationDeserialize = window.Annotations.StampAnnotation.prototype.deserialize;
        window.Annotations.StampAnnotation.prototype.deserialize = function (element, pageMatrix) {
            stampAnnotationDeserialize.call(this, element, pageMatrix);
            this.Rotation = element.getAttribute("rotation");
            this.Opacity = this.geometraOpacity;
            this.MaintainAspectRatio = element.getAttribute("maintainAspectRatio") === "true";
            this.ReadOnly = element.getAttribute("readOnly") === "true";
            this.Hidden = element.getAttribute("Hidden") === "true";
        };

        const stampAnnotationDraw = window.Annotations.StampAnnotation.prototype.draw;
        window.Annotations.StampAnnotation.prototype.draw = function (ctx) {
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

            if (this.Color) {
                this.Color.A = this.geometraBorderOpacity;
            }

            ctx.strokeStyle = this.Color;

            ctx.lineWidth = this.StrokeThickness;

            const padding = 25;

            const firstPoint = { x: this.getX() - padding * 2, y: this.getY() - padding * 2 };

            const secondPoint = { x: this.getWidth() + padding, y: this.getHeight() + padding };

            ctx.translate(firstPoint.x, firstPoint.y);

            ctx.moveTo(0, 0);

            ctx.rect(padding * 2, padding * 2, secondPoint.x - padding, secondPoint.y - padding);

            if (this.Subject !== "Point") ctx.stroke();
            ctx.restore();

            stampAnnotationDraw.apply(this, arguments);
        };
    }
}
