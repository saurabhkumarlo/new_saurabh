export default class EllipseToolCustomizer {
    init(initializer, window, calculator) {
        window.Tools.EllipseCreateTool.prototype.addEventListener("annotationAdded", function () {
            initializer.setIsDrawing(false);
        });
        window.Tools.EllipseCreateTool.prototype.addEventListener("annotationCreated", function (annotation) {
            initializer.setIsDrawing(true);
            annotation.newAnnotation = true;
            annotation.formulaNA = "";
            annotation.formulaNL = "";
            annotation.formulaNVO = "";
            annotation.formulaNV = "";
            annotation.style = "solid";
        });
    }
}
