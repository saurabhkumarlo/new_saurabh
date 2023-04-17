class DisplayValuesHolder {
    constructor(parentId) {
        this.parentId = parentId;
        this.centerAnnotation = undefined;
        this.centerAnnotationPdf = undefined;
        this.peripheralAnnotations = undefined;
        this.peripheralAnnotationsPdf = undefined;
    }

    setCenterAnnotation(centerAnnotation) {
        this.centerAnnotation = centerAnnotation;
    }

    getCenterAnnotation() {
        return this.centerAnnotation;
    }

    setCenterAnnotationPdf(centerAnnotationPdf) {
        this.centerAnnotationPdf = centerAnnotationPdf;
    }

    getCenterAnnotationPdf() {
        return this.centerAnnotationPdf;
    }

    setPeripheralAnnotations(peripheralAnnotations) {
        this.peripheralAnnotations = peripheralAnnotations;
    }

    getPeripheralAnnotations() {
        return this.peripheralAnnotations;
    }

    setPeripheralAnnotationsPdf(peripheralAnnotations) {
        this.peripheralAnnotationsPdf = peripheralAnnotations;
    }

    getPeripheralAnnotationsPdf() {
        return this.peripheralAnnotationsPdf;
    }

    remove(displayAnnotation) {
        if (displayAnnotation.get("type") === "CenterValue") {
            this.centerAnnotation = undefined;
            this.centerAnnotationPdf = undefined;
        } else if (displayAnnotation.get("type") === "PeripheralValue") {
            this.peripheralAnnotationsPdf = undefined;
            this.peripheralAnnotations = undefined;
        }
        const retval = !this.centerAnnotation && !this.centerAnnotationPdf && !this.peripheralAnnotationsPdf && !this.peripheralAnnotations;

        return retval;
    }
}

export default DisplayValuesHolder;
