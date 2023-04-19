import { ANNOT_TYPES } from "constants/AnnotationConstants";

export default class AnnotationCustomizer {
    init(window, selectable = true) {
        const annotationSerialize = window.Annotations.Annotation.prototype.serialize;
        window.Annotations.Annotation.prototype.serialize = function (element, pageMatrix) {
            let el = annotationSerialize.call(this, element, pageMatrix);
            switch (this.Subject) {
                case "Polyline":
                case "x-scale":
                case "y-scale":
                    el.setAttribute("geometraLineStart", this.geometraLineStart);
                    el.setAttribute("geometraLineEnd", this.geometraLineEnd);
                    break;
                case "Polygon":
                case "Reduction":
                case "Ellipse":
                case "annotation.freeHand":
                case "Free hand":
                case "Free Hand":
                    el.setAttribute("annotationNumber", this.annotationNumber);
                    el.setAttribute("annotationHeight", JSON.stringify(this.annotationHeight));
                    break;
                case "Point":
                    el.setAttribute("annotationNumber", this.annotationNumber);
                    break;
                default:
                    el.setAttribute("strokeColor", this.strokeColor);
                    break;
            }
            el.setAttribute("annotationName", this.annotationName);
            el.setAttribute("geometraOpacity", this.geometraOpacity || 1);
            el.setAttribute("rotationControlEnabled", this.rotationControlEnabled);
            el.setAttribute("geometraBorderOpacity", this.geometraBorderOpacity);
            el.setAttribute("style", this.style);
            el.setAttribute("status", this.status);
            el.setAttribute("labels", JSON.stringify(this.labels));
            el.setAttribute("vertices", JSON.stringify(this.vertices));
            el.setAttribute("readOnly", this.ReadOnly);
            el.setAttribute("annotationQuantity", this.annotationQuantity);
            el.setAttribute("annotationType", this.annotationType);
            el.setAttribute("geoAnnotId", this.geoAnnotId);
            el.setAttribute("geoFileId", this.geoFileId);
            el.setAttribute("geoEstimateId", this.geoEstimateId);
            el.setAttribute("pageNumber", this.pageNumber);
            if (this.Subject === ANNOT_TYPES.REDUCTION) el.setAttribute("geoParentId", this.geoParentId);

            if (this["ESTIMATE.ANNOTATION_PROPERTIES.TILES_X"]) {
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", this["ESTIMATE.ANNOTATION_PROPERTIES.TILES_X"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", this["ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", this["ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", this["ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", this["ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH"]);
            }
            if (this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"]) {
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"]);
            }
            if (this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"]) {
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"]);
                el.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"]);
            }
            if (this.Subject === "Polygon" || this.Subject === "Reduction" || this.Subject === "Ellipse" || this.Subject === "Free Hand") {
                this.Bk.A = this.geometraBorderOpacity;
            }

            return el;
        };
        const annotationDeserialize = window.Annotations.Annotation.prototype.deserialize;
        window.Annotations.Annotation.prototype.deserialize = function (el, pageMatrix) {
            annotationDeserialize.call(this, el, pageMatrix);

            if (el.getAttribute("rotationControlEnabled") === "true") this.enableRotationControl();
            else this.disableRotationControl();

            switch (this.Subject) {
                case "Polyline":
                    this.geometraLineStart = el.getAttribute("geometraLineStart");
                    this.geometraLineEnd = el.getAttribute("geometraLineEnd");
                    this.annotationNumber = el.getAttribute("annotationNumber");
                    this.annotationHeight =
                        el.getAttribute("annotationHeight") &&
                        el.getAttribute("annotationHeight") != "undefined" &&
                        el.getAttribute("annotationHeight") != "null"
                            ? JSON.parse(el.getAttribute("annotationHeight"))
                            : undefined;
                    break;
                case "x-scale":
                case "y-scale":
                    this.geometraLineStart = el.getAttribute("geometraLineStart");
                    this.geometraLineEnd = el.getAttribute("geometraLineEnd");
                    break;
                case "Polygon":
                case "Reduction":
                case "Ellipse":
                case "annotation.freeHand":
                case "Free hand":
                case "Free Hand":
                    this.annotationNumber = el.getAttribute("annotationNumber");
                    this.annotationHeight =
                        el.getAttribute("annotationHeight") &&
                        el.getAttribute("annotationHeight") != "undefined" &&
                        el.getAttribute("annotationHeight") != "null"
                            ? JSON.parse(el.getAttribute("annotationHeight"))
                            : undefined;
                    break;
                case "Point":
                    this.annotationNumber = el.getAttribute("annotationNumber");
                    break;
                default:
                    this.strokeColor = el.getAttribute("strokeColor");
                    break;
            }
            this.status = el.getAttribute("status");

            try {
                this.labels = JSON.parse(el.getAttribute("labels"));
            } catch (e) {
                this.labels = null;
            }
            try {
                this.vertices = JSON.parse(el.getAttribute("vertices"));
            } catch (e) {
                this.vertices = null;
            }

            this.annotationName = el.getAttribute("annotationName");
            this.rotationControlEnabled = el.getAttribute("rotationControlEnabled") === "true";
            this.ReadOnly = el.getAttribute("readOnly") === "true";
            this.annotationQuantity = Number(el.getAttribute("annotationQuantity"));
            this.annotationType = el.getAttribute("annotationType");
            this.geoAnnotId = Number(el.getAttribute("geoAnnotId"));
            this.geoFileId = Number(el.getAttribute("geoFileId"));
            this.geoEstimateId = Number(el.getAttribute("geoEstimateId"));
            this.pageNumber = Number(el.getAttribute("page")) + 1;
            if (el.getAttribute("subject") === ANNOT_TYPES.REDUCTION) this.geoParentId = el.getAttribute("geoParentId");

            const opacity = parseFloat(el.getAttribute("geometraOpacity"));
            const borderOpacity = parseFloat(el.getAttribute("geometraBorderOpacity"));
            if (!Number.isNaN(opacity)) {
                this.geometraOpacity = opacity;
            } else {
                this.geometraOpacity = 0.5;
            }

            if (!Number.isNaN(borderOpacity)) {
                this.geometraBorderOpacity = borderOpacity;
            } else {
                this.geometraBorderOpacity = 0.5;
            }

            this.Hidden = false;
            if (el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X")) {
                this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X")
                    ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X"))
                    : undefined;
                this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y")
                    ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y"))
                    : undefined;
                this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X")
                    ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X"))
                    : undefined;
                this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y")
                    ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y"))
                    : undefined;
                this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH")
                    ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH"))
                    : undefined;
            }
            this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"))
                : undefined;

            this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"))
                : undefined;
            this["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"] = el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH")
                ? Number.parseFloat(el.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"))
                : undefined;
        };

        if (selectable) {
            window.Annotations.ControlHandle.prototype.draw = function (ctx, annotation, selectionBox, zoom) {
                const dim = this.getDimensions(annotation, selectionBox, zoom);
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = "rgba(129, 134, 139, 1.0)";
                ctx.lineWidth = 0.15;
                const centerX = dim.x1 + dim.getWidth() / 2;
                const centerY = dim.y1 + dim.getHeight() / 2;
                ctx.moveTo(centerX - dim.getWidth() * 1.5, centerY);
                ctx.lineTo(centerX + dim.getWidth() * 1.5, centerY);
                ctx.moveTo(centerX, centerY - dim.getHeight() * 1.5);
                ctx.lineTo(centerX, centerY + dim.getHeight() * 1.5);
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.fillStyle = "rgba(255,255,255,0.0)";
                ctx.fillRect(dim.x1, dim.y1, dim.getWidth(), dim.getHeight());
                ctx.strokeStyle = "rgba(129, 134, 139, 1.0)";
                ctx.lineWidth = 0.15;
                ctx.strokeRect(dim.x1, dim.y1, dim.getWidth(), dim.getHeight());
                ctx.restore();
            };

            window.Annotations.SelectionAlgorithm.canvasVisibilityPadding = 0;

            window.Annotations.SelectionModel.prototype.testSelection = function (annotation, x, y, pageMatrix) {
                return window.Annotations.SelectionAlgorithm.canvasVisibilityTest(annotation, x, y, pageMatrix);
            };
        } else {
            window.Annotations.ControlHandle.prototype.draw = function (ctx, annotation, selectionBox, zoom) {};
        }

        window.Annotations.SelectionModel.prototype.drawSelectionOutline = function (ctx, annotation, zoom) {
            if (annotation.Subject === "Free text") {
                ctx.save();
                const rect = annotation.getRect();
                ctx.beginPath();
                ctx.moveTo(rect.x1, rect.y1);
                ctx.lineTo(rect.x2, rect.y1);
                ctx.lineTo(rect.x2, rect.y2);
                ctx.lineTo(rect.x1, rect.y2);
                ctx.lineTo(rect.x1, rect.y1);
                ctx.setLineDash([3]);
                ctx.strokeStyle = "rgba(90,177,74,0.7)";
                ctx.lineWidth = "0.5";
                ctx.stroke();
                ctx.restore();
            }
        };

        const lineDraw = window.Annotations.LineAnnotation.prototype.draw;
        window.Annotations.LineAnnotation.prototype.draw = function (ctx, pageMatrix) {
            if (this.Subject === "SnapOnHelper") {
                const firstPoint = this.getStartPoint();
                const secondPoint = this.getEndPoint();

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
            } else {
                lineDraw.apply(this, arguments);
            }
        };
    }
}
