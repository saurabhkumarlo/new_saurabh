export default class PrintHelper {
    constructor() {
        this.window = undefined;
    }

    init(window, calculator) {
        this.window = window;
        this.calculator = calculator;
    }

    async getDisplayValuesAnnotations(annotationManager) {
        let displayAnnotations = [];
        try {
            const annotations = annotationManager.getSelectedAnnotations();

            for (let i = 0; i < annotations.length; i++) {
                switch (annotations[i].Subject) {
                    case "Point":
                        if (annotations[i].iconType == "none") {
                            let annotationToPrint = new this.window.Annotations.PolygonAnnotation();
                            const point = new this.window.Annotations.Point(annotations[i].X, annotations[i].Y);
                            const width = annotations[i].Width;
                            const height = annotations[i].Height;
                            point.y = annotations[i].Y + width / 2;
                            point.x = annotations[i].X + height / 2;
                            annotationToPrint.PageNumber = annotations[i].PageNumber;
                            annotationToPrint.FillColor = annotations[i].FillColor;
                            annotationToPrint.FillColor.A = 0.8;
                            annotationToPrint.StrokeColor = annotations[i].FillColor;
                            annotationToPrint.Opacity = annotations[i].geometraOpacity;
                            while (annotationToPrint.getPath().length > 0) {
                                annotationToPrint.popPath();
                            }
                            annotationToPrint.addPathPoint(point.x - width / 2, point.y - height / 2);
                            annotationToPrint.addPathPoint(point.x + width / 2, point.y - height / 2);
                            annotationToPrint.addPathPoint(point.x + width / 2, point.y + height / 2);
                            annotationToPrint.addPathPoint(point.x - width / 2, point.y + height / 2);
                            annotationToPrint.addPathPoint(point.x - width / 2, point.y - height / 2);
                            annotationToPrint.showName = annotations[i].showName;
                            annotationToPrint.showNumber = annotations[i].showNumber;
                            annotationToPrint.annotationName = annotations[i].annotationName;
                            annotationToPrint.annotationNumber = annotations[i].annotationNumber;
                            displayAnnotations.push(annotationToPrint);
                        } else if (annotations[i].iconType != "none") {
                            const stampAnnot = new this.window.Annotations.StampAnnotation();
                            stampAnnot.PageNumber = annotations[i].PageNumber;
                            stampAnnot.X = annotations[i].X;
                            stampAnnot.Y = annotations[i].Y;
                            stampAnnot.Width = annotations[i].Width;
                            stampAnnot.Height = annotations[i].Height;
                            stampAnnot.Opacity = annotations[i].geometraOpacity;
                            stampAnnot.Rotation = annotations[i].Rotation;
                            stampAnnot.ImageData = this.calculator.svgString2Image(
                                annotations[i].ImageData,
                                annotations[i].Width * 20,
                                annotations[i].Height * 20,
                                undefined,
                                annotations[i].geometraOpacity
                            );

                            await stampAnnot.resourcesLoaded();

                            const fakeAnnotationToPrint = new this.window.Annotations.PolygonAnnotation();
                            const point = new this.window.Annotations.Point(annotations[i].X, annotations[i].Y);
                            const width = annotations[i].Width;
                            const height = annotations[i].Height;
                            point.y = annotations[i].Y + width / 2;
                            point.x = annotations[i].X + height / 2;
                            while (fakeAnnotationToPrint.getPath().length > 0) {
                                fakeAnnotationToPrint.popPath();
                            }
                            fakeAnnotationToPrint.addPathPoint(point.x - width / 2, point.y - height / 2);
                            fakeAnnotationToPrint.addPathPoint(point.x + width / 2, point.y - height / 2);
                            fakeAnnotationToPrint.addPathPoint(point.x + width / 2, point.y + height / 2);
                            fakeAnnotationToPrint.addPathPoint(point.x - width / 2, point.y + height / 2);
                            fakeAnnotationToPrint.addPathPoint(point.x - width / 2, point.y - height / 2);
                            fakeAnnotationToPrint.showName = annotations[i].showName;
                            fakeAnnotationToPrint.showNumber = annotations[i].showNumber;
                            fakeAnnotationToPrint.annotationName = annotations[i].annotationName;
                            fakeAnnotationToPrint.annotationNumber = annotations[i].annotationNumber;
                            displayAnnotations.push(stampAnnot);
                        } else {
                            console.log("Error printing Point Annotation");
                        }
                        break;
                    case "Polyline":
                    case "y-scale":
                    case "x-scale":
                        if (annotations[i].Subject === "x-scale" || annotations[i].Subject === "y-scale") {
                            displayAnnotations.push(annotations[i]);

                            const startPoint = annotations[i].getPathPoint(0);
                            const endPoint = annotations[i].getPathPoint(1);
                            const dx = annotations[i].getPathPoint(0).x - annotations[i].getPathPoint(1).x;
                            const dy = annotations[i].getPathPoint(0).y - annotations[i].getPathPoint(1).y;
                            const rotation = Math.atan2(dy, dx);
                            //First the horisontal lines
                            const startHorisontalLine = new this.window.Annotations.LineAnnotation();
                            startHorisontalLine.StrokeColor = annotations[i].StrokeColor;
                            const endHorisontalLine = new this.window.Annotations.LineAnnotation();
                            endHorisontalLine.StrokeColor = annotations[i].StrokeColor;
                            startHorisontalLine.setStartPoint(
                                startPoint.x + 10 * Math.cos(rotation + Math.PI / 2),
                                startPoint.y + 10 * Math.sin(rotation + Math.PI / 2)
                            );
                            startHorisontalLine.setEndPoint(
                                startPoint.x + 10 * Math.cos(rotation - Math.PI / 2),
                                startPoint.y + 10 * Math.sin(rotation - Math.PI / 2)
                            );

                            endHorisontalLine.setStartPoint(
                                endPoint.x + 10 * Math.cos(rotation + Math.PI / 2),
                                endPoint.y + 10 * Math.sin(rotation + Math.PI / 2)
                            );
                            endHorisontalLine.setEndPoint(
                                endPoint.x + 10 * Math.cos(rotation - Math.PI / 2),
                                endPoint.y + 10 * Math.sin(rotation - Math.PI / 2)
                            );

                            // Arrows
                            const startArrowLine1 = new this.window.Annotations.LineAnnotation();
                            startArrowLine1.StrokeColor = annotations[i].StrokeColor;
                            startArrowLine1.StrokeColor = annotations[i].StrokeColor;
                            startArrowLine1.setStartPoint(startPoint.x, startPoint.y);
                            startArrowLine1.setEndPoint(
                                startPoint.x + 15 * Math.cos(Math.PI + rotation + Math.PI / 4),
                                startPoint.y + 15 * Math.sin(Math.PI + rotation + Math.PI / 4)
                            );
                            const startArrowLine2 = new this.window.Annotations.LineAnnotation();
                            startArrowLine2.StrokeColor = annotations[i].StrokeColor;
                            startArrowLine2.setStartPoint(startPoint.x, startPoint.y);
                            startArrowLine2.setEndPoint(
                                startPoint.x + 15 * Math.cos(Math.PI + rotation - Math.PI / 4),
                                startPoint.y + 15 * Math.sin(Math.PI + rotation - Math.PI / 4)
                            );

                            const endArrowLine1 = new this.window.Annotations.LineAnnotation();
                            endArrowLine1.StrokeColor = annotations[i].StrokeColor;
                            endArrowLine1.setStartPoint(endPoint.x, endPoint.y);
                            endArrowLine1.setEndPoint(endPoint.x + 15 * Math.cos(rotation + Math.PI / 4), endPoint.y + 15 * Math.sin(rotation + Math.PI / 4));
                            const endArrowLine2 = new this.window.Annotations.LineAnnotation();
                            endArrowLine2.StrokeColor = annotations[i].StrokeColor;
                            endArrowLine2.setStartPoint(endPoint.x, endPoint.y);
                            endArrowLine2.setEndPoint(endPoint.x + 15 * Math.cos(rotation - Math.PI / 4), endPoint.y + 15 * Math.sin(rotation - Math.PI / 4));

                            annotations[i].Printable = true;
                            displayAnnotations.push(startHorisontalLine);
                            displayAnnotations.push(endHorisontalLine);
                            displayAnnotations.push(startArrowLine1);
                            displayAnnotations.push(startArrowLine2);
                            displayAnnotations.push(endArrowLine1);
                            displayAnnotations.push(endArrowLine2);
                        } else {
                            annotations[i].Opacity = annotations[i].geometraOpacity;
                            annotations[i].Printable = true;
                        }
                        break;
                    case "Polygon":
                    case "Reduction":
                        annotations[i].Opacity = annotations[i].geometraOpacity;
                        annotations[i].Printable = true;
                        break;
                    case "Ellipse":
                        annotations[i].Opacity = annotations[i].geometraOpacity;
                        annotations[i].Printable = true;
                        break;
                    case "Free Hand":
                    case "Free hand":
                        try {
                            let annotationToPrint2 = new this.window.Annotations.PolygonAnnotation();
                            annotationToPrint2.FillColor = new this.window.Annotations.Color();
                            annotationToPrint2.StrokeColor = new this.window.Annotations.Color();
                            annotationToPrint2.FillColor.R = annotations[i].FillColor.R;
                            annotationToPrint2.FillColor.G = annotations[i].FillColor.G;
                            annotationToPrint2.FillColor.B = annotations[i].FillColor.B;
                            annotationToPrint2.FillColor.A = 0.3;
                            annotationToPrint2.StrokeColor.R = annotations[i].FillColor.R;
                            annotationToPrint2.StrokeColor.G = annotations[i].FillColor.G;
                            annotationToPrint2.StrokeColor.B = annotations[i].FillColor.B;
                            annotationToPrint2.StrokeColor.A = 0.01;
                            annotationToPrint2.Opacity = annotations[i].geometraOpacity;
                            for (let j = 0; j < annotations[i].getPath(0).length; j++) {
                                annotationToPrint2.addPathPoint(annotations[i].getPathPoint(j, 0).x, annotations[i].getPathPoint(j, 0).y);
                            }
                            displayAnnotations.push(annotationToPrint2);
                        } catch (error) {
                            console.log("error: " + error.stack);
                        }
                        break;
                    case "FreeText":
                    case "Freetext":
                    case "Stamp":
                    case "Free text":
                        annotations[i].Opacity = annotations[i].geometraOpacity;
                        annotations[i].Printable = true;
                        break;
                    default:
                        break;
                }
            }
            // }
        } catch (error) {
            console.log("DisplayValuesLibrary error adding text annotation: " + error.stack);
        }
        return displayAnnotations;
    }
}
