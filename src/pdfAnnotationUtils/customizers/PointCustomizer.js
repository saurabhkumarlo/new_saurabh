import IconTypeStore from "./../../stores/IconTypeStore";
import { LABELS, RENDER_TYPES } from "constants/LabelsConstants";

export default class PointCustomizer {
    constructor() {
        this.calculator = undefined;
        this.PointAnnotation = undefined;
    }

    init(window, calculator, selectable = true) {
        const PointSelectionModel = function (annotation, canModify) {
            window.Annotations.SelectionModel.call(this, annotation, canModify);
        };

        PointSelectionModel.prototype = new window.Annotations.SelectionModel();

        PointSelectionModel.prototype.drawSelectionOutline = function () {
            return false;
        };
        PointSelectionModel.prototype.getControlHandlers = function () {
            return undefined;
        };
        PointSelectionModel.prototype.testSelection = function (annotation, x, y, pageMatrix) {
            if (selectable) {
                return window.Annotations.SelectionAlgorithm.canvasVisibilityTest(annotation, x, y, pageMatrix);
            }
            return false;
        };

        this.PointAnnotation = function () {
            window.Annotations.StampAnnotation.call(this);
            this.Subject = "Point";
        };

        this.PointAnnotation.prototype = new window.Annotations.StampAnnotation();
        this.PointAnnotation.prototype.elementName = "point";

        this.PointAnnotation.prototype.draw = function (ctx) {
            const labels = this.labels;
            const activeLabels = labels?.active;
            const styles = labels?.centralStyles;

            ctx.save();
            if (this.iconType && this.iconType != "none") {
                const tempColor = new window.Annotations.Color(this.FillColor.R, this.FillColor.G, this.FillColor.B);
                tempColor.A = 0.01;
                ctx.fillStyle = tempColor.toString();
            } else {
                ctx.fillStyle = this.FillColor.toString();
            }
            let rotation = window.docViewer.getCompleteRotation(window.docViewer.getCurrentPage());
            rotation = (-90 * rotation * Math.PI) / 180;
            ctx.fillRect(this.X, this.Y, this.Width, this.Height);
            ctx.restore();

            if (activeLabels?.length > 0) {
                const centerTextToShow = [];
                if (activeLabels.includes(LABELS.NR_TAG)) centerTextToShow.push("[" + this.annotationNumber + "]");
                if (activeLabels.includes(LABELS.NAME)) centerTextToShow.push(this.annotationName);
                if (centerTextToShow.length > 0) {
                    calculator.buildOrDrawPointData(styles, ctx, rotation, this, centerTextToShow);
                }
            }

            try {
                if (this.iconType && this.iconType != "none") {
                    const svgFillOpacityExp = /fill-opacity="(\d+\.\d+)/;
                    const svgXML = IconTypeStore.getIcon(this.iconType);
                    const colouredSvgXml = svgXML.replace('"green"', '"' + this.FillColor + '"');
                    const match = colouredSvgXml.match(svgFillOpacityExp);
                    const opacityColourSvg = colouredSvgXml.replace(match[1], 1);
                    this.ImageData = "data:image/svg+xml;charset=utf-8," + opacityColourSvg;
                    window.Annotations.StampAnnotation.prototype.draw.apply(this, arguments);
                }
            } catch (error) {
                console.log("error checking src " + error.stack);
            }
        };

        this.PointAnnotation.prototype.selectionModel = PointSelectionModel;

        this.PointAnnotation.prototype.serialize = function (element, pageMatrix) {
            const el = window.Annotations.StampAnnotation.prototype.serialize.call(this, element, pageMatrix);
            el.setAttribute("pointSize", this.Width);
            el.setAttribute("iconType", this.iconType);
            el.setAttribute("rotation", this.Rotation);
            el.setAttribute("geometraOpacity", this.geometraOpacity);
            el.setAttribute("readOnly", this.ReadOnly);
            el.setAttribute("Hidden", this.Hidden);
            return el;
        };
        //
        this.PointAnnotation.prototype.deserialize = function (element, pageMatrix) {
            window.Annotations.StampAnnotation.prototype.deserialize.call(this, element, pageMatrix);
            this.Width = element.getAttribute("pointSize");
            this.Height = element.getAttribute("pointSize");
            this.iconType = element.getAttribute("iconType");
            this.currentFontSize = calculator.getFontSize(this);
            this.geometraOpacity = element.getAttribute("geometraOpacity");
            this.Rotation = element.getAttribute("rotation") ? element.getAttribute("rotation") : 0;
            if (this.Rotation == "undefined") {
                this.Rotation = 0;
            }
            this.iconColor = element.getAttribute("color");
            this.ReadOnly = element.getAttribute("readOnly") === "true";
            this.Hidden = element.getAttribute("Hidden") === "true";
        };
    }

    getPointAnnotation() {
        return this.PointAnnotation;
    }
}
