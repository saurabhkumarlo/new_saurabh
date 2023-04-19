import { RENDER_TYPES } from "constants/LabelsConstants";
import PolygonCalculator from "./PolygonCalculator";

export default class PointCalculator extends PolygonCalculator {
    buildOrDrawPointData(styles, ctx, rotation, annot, centerTextToShow) {
        const fontSize = Number(styles.fontSize);
        const x = Number(styles.x);
        const y = Number(styles.y);
        const fontStyles = styles.fontStyles ? styles.fontStyles.join(" ") : "";
        const margin = 10;
        const bgPadding = fontSize / 2;

        let textX = 0;
        let textY = 0;
        let rowText = "";
        let bgWidth;
        let bgHeight;
        let bgX;
        let bgY;

        ctx.save();
        ctx.font = `${fontStyles} ${fontSize}px ${styles.font}`;
        ctx.translate(annot.X + x, annot.Y + y);
        ctx.rotate(rotation);

        switch (styles.render) {
            case RENDER_TYPES.RIGHT_ROWS.value:
                textX = annot.Width + margin;
                textY = fontSize / 2 + annot.Height / 2 - (fontSize * (centerTextToShow.length - 1)) / 2;
                bgWidth = ctx.measureText(centerTextToShow.sort((a, b) => b.length - a.length)[0]).width + bgPadding;
                bgHeight = centerTextToShow.length * fontSize + bgPadding;
                bgX = textX - bgPadding / 2;
                bgY = textY - fontSize;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                ctx.textAlign = "left";
                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                for (let i = 0; i < centerTextToShow.length; i++) {
                    ctx.fillText(centerTextToShow[i], textX, textY);
                    textY += fontSize;
                }
                break;
            case RENDER_TYPES.BELOW_GROUPED.value:
                centerTextToShow.forEach((item, index) => {
                    rowText += item;
                    if (index + 1 < centerTextToShow.length) rowText += " | ";
                });

                textX = annot.Width / 2;
                textY = fontSize + annot.Height + margin;
                bgWidth = ctx.measureText(rowText).width + bgPadding;
                bgHeight = fontSize + bgPadding;
                bgX = textX - bgWidth / 2;
                bgY = textY - fontSize;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                ctx.textAlign = "center";
                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                ctx.fillText(rowText, textX, textY);
                break;
            case RENDER_TYPES.BELOW_ROWS.value:
                textX = annot.Width / 2;
                textY = fontSize + annot.Height + margin;
                bgWidth = ctx.measureText(centerTextToShow.sort((a, b) => b.length - a.length)[0]).width + bgPadding;
                bgHeight = centerTextToShow.length * fontSize + bgPadding;
                bgX = textX - bgWidth / 2;
                bgY = textY - fontSize;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                ctx.textAlign = "center";
                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                for (let i = 0; i < centerTextToShow.length; i++) {
                    ctx.fillText(centerTextToShow[i], textX, textY);
                    textY += fontSize;
                }
                break;
            default:
                centerTextToShow.forEach((item, index) => {
                    rowText += item;
                    if (index + 1 < centerTextToShow.length) rowText += " | ";
                });

                textX = annot.Width + margin;
                textY = fontSize / 2 + annot.Height / 2 - (fontSize * Math.trunc((centerTextToShow.length - 1) / 4)) / 2;
                bgWidth = ctx.measureText(rowText).width + bgPadding;
                bgHeight = fontSize + bgPadding;
                bgX = textX - bgPadding / 2;
                bgY = textY - fontSize;

                ctx.fillStyle = this.getColorWithOpacity(styles.bgColor, styles.bgOpacity);
                this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight);

                ctx.textAlign = "left";
                ctx.fillStyle = this.getColorWithOpacity(styles.color, styles.opacity);
                ctx.fillText(rowText, textX, textY);
                break;
        }
        ctx.restore();
    }
}
