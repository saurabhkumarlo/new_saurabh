export default class AnnotCommandHandler {
    constructor() {
        const annotCommandTemplate =
            '<?xml version="1.0" encoding="UTF-8" ?>' +
            '<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">' +
            "<fields />" +
            "<add> </add>" +
            "<modify></modify>" +
            "<delete> </delete>" +
            "</xfdf>";
        const parser = new DOMParser();
        this.xfdfElements = parser.parseFromString(annotCommandTemplate, "text/xml");
        this.modify = this.xfdfElements.querySelector("modify");
        this.add = this.xfdfElements.querySelector("add");
        this.delete = this.xfdfElements.querySelector("delete");
    }

    addAddedCommand(addXfdf) {
        const tempParser = new DOMParser();
        const modifiedElements = tempParser.parseFromString(addXfdf, "text/xml");
        const firstChild = modifiedElements.querySelector("annots").firstElementChild;
        if (firstChild) this.add.appendChild(firstChild);
        return firstChild;
    }

    addModifyCommand(modifiedXfxf) {
        if (this.xfdfElements) {
            const tempParser = new DOMParser();
            const modifiedElements = tempParser.parseFromString(modifiedXfxf, "text/xml");
            const firstChild = modifiedElements.querySelector("annots").firstElementChild;
            this.modify.appendChild(firstChild);
        }
    }

    addDeletedCommand(deletedXfdf) {
        if (this.xfdfElements) {
            const idElement = this.xfdfElements.createElement("id");
            const tempParser = new DOMParser();
            const deletedElements = tempParser.parseFromString(deletedXfdf, "text/xml");
            const firstChild = deletedElements.querySelector("annots").firstElementChild;
            const textNode = this.xfdfElements.createTextNode(firstChild.getAttribute("name"));
            idElement.setAttribute("page", firstChild.getAttribute("page"));
            idElement.appendChild(textNode);
            this.delete.appendChild(idElement);
        }
    }

    getAnnotCommand() {
        let annotCommand = undefined;
        if (this.xfdfElements) {
            const oSerializer = new XMLSerializer();
            annotCommand = oSerializer.serializeToString(this.xfdfElements);
        }
        return annotCommand;
    }

    getModifyList(modifyXfdf) {
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(modifyXfdf, "text/xml");
        const children = xfdfElements.querySelector("modify").children;
        return children;
    }
}
