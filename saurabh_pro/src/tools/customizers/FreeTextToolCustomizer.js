class FreeTextToolCustomizer {
    init(initializer, webviewer) {
        const freeTexMouseLeftDown = webviewer.Tools.FreeTextCreateTool.prototype.mouseLeftDown;
        webviewer.Tools.FreeTextCreateTool.prototype.mouseLeftDown = function () {
            if (!initializer.isDrawing()) {
                webviewer.annotManager.deselectAllAnnotations();
            }
            freeTexMouseLeftDown.apply(this, arguments);
        };

        webviewer.Tools.FreeTextCreateTool.prototype.addEventListener("annotationAdded", () => {
            initializer.setIsDrawing(false);
        });

        webviewer.Tools.FreeTextCreateTool.prototype.addEventListener("annotationCreated", () => {
            initializer.setIsDrawing(true);
        });
    }
}

export default FreeTextToolCustomizer;
