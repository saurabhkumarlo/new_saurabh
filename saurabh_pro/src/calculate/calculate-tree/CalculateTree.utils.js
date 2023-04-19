import { AnnotationStore } from "stores";
import Immutable from "immutable";

export const handleFolderChanged = ({ key, selectedAnnotations, projectId, onMovePreventEditingAnnots, onChange = false }) => {
    const selectedAnnots = selectedAnnotations.toJS();
    const folderAnnots = selectedAnnots.filter((annot) => annot.type === "group");
    const standardAnnots = selectedAnnots.filter((annot) => annot.type !== "group");

    const preventEditingAnnots = getPreventEditingAnnots(standardAnnots);
    if (preventEditingAnnots.length > 0) {
        onMovePreventEditingAnnots(Immutable.fromJS(preventEditingAnnots));
        return;
    }
    const mainFolders = getNotNestedFolders(folderAnnots);
    let annotsInSelectedFolders = [];
    let annotsOutsideSelectedFolders = [];

    standardAnnots.forEach((annot) => {
        if (folderAnnots.some((folder) => folder.id.toString() === annot.parentId)) {
            annotsInSelectedFolders.push(annot);
        } else {
            annotsOutsideSelectedFolders.push(annot);
        }
    });

    const annotsToUpdate = annotsOutsideSelectedFolders.filter(
        (annot) => annot.type !== "Reduction" && annot.type !== "CenterValue" && annot.type !== "PerifpheralValue"
    );

    if (key === "root") {
        key = null;
    }
    if (annotsToUpdate.length > 0 || mainFolders.length > 0) {
        if (onChange) onChange([...annotsToUpdate, ...mainFolders], key, "parentId");
        else AnnotationStore.onRequestAnnotationUpdateArray(Immutable.fromJS([...annotsToUpdate, ...mainFolders]), "parentId", key);
    }

    AnnotationStore.onSetActiveParentId(key, true);
    // const annotation = AnnotationStore.getAnnotationById(key);
    // if (annotation) {
    //     AnnotationStore.setActiveAnnotation(annotation);
    // }
};

const getNotNestedFolders = (foldersList) => {
    return foldersList.filter((folder) =>
        foldersList.every((otherFolder) => {
            if (otherFolder.id === folder.id) return true;
            return folder.parentId !== otherFolder.id.toString();
        })
    );
};

export const getPreventEditingAnnots = (annotList) => {
    let preventEditingAnnots = [];

    annotList.forEach((annot) => {
        if (annot.type === "3DModel") {
            if (annot.xfdf.readOnly) preventEditingAnnots.push(annot);
            return;
        }
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(annot.xfdf || annot.xdf, "text/xml");
        const annotElement = xfdfElements.querySelector("annots").firstElementChild;
        if (annotElement.getAttribute("readOnly") === "true") {
            preventEditingAnnots.push(annot);
        }
    });
    return preventEditingAnnots;
};
