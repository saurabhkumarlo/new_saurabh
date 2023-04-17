export default class ArrowToolCustomizer {
    init(webviewer) {
        const ArrowCreateTool = webviewer.Tools.ArrowCreateTool;
        const arrowMouseUp = ArrowCreateTool.prototype.mouseLeftUp;
        ArrowCreateTool.prototype.mouseLeftUp = function () {
            if (this.annotation) {
                this.annotation.Subject = "Arrow";
                arrowMouseUp.apply(this, arguments);
            }
        };
    }
}
