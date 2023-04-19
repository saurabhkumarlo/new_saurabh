import React from "react";
import { faRulerHorizontal, faRulerVertical } from "@fortawesome/free-solid-svg-icons";
import { faFolder } from "@fortawesome/free-regular-svg-icons";
import AnnotationStore from "./AnnotationStore";
import _ from "lodash";
import HeaderStore from "./HeaderStore";
import Immutable from "immutable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProjectsStore from "./ProjectsStore";
import { createStore } from "reflux";
import i18n from "../i18nextInitialized";
import NodeSocketStore from "./NodeSocketStore";
import { ANNOTATION_ACTION_NAME, GROUP_NAME } from "constants/NodeActionsConstants";
import ObjectsStore from "./ObjectsStore";
import { ANNOT_TYPES } from "../constants/AnnotationConstants";

const sortOrder = {
    "x-scale": -2,
    "y-scale": -1,
    group: 0,
    Polygon: 1,
    Ellipse: 2,
    "annotation.freeHand": 3,
    FreeHand: 3,
    Freehand: 3,
    freehand: 3,
    freeHand: 3,
    Polyline: 4,
    Arrow: 5,
    Point: 6,
    FreeText: 7,
    Freetext: 7,
    "Free text": 7,
    "Free Text": 7,
    Stamp: 8,
    Comment: 9,
    "3DModel": 10,
};

export default createStore({
    listenables: [],

    init() {
        this.treeFilter = undefined;
        this.selectAll = false;
        this.checkedFilters = ["notStarted", "progress", "review", "complete"];
        this.popoverVisible = false;
        this.folderMapping = {};
    },
    getFolderMapping() {
        return this.folderMapping;
    },
    getCheckedFilters() {
        return this.checkedFilters;
    },
    getCheckedFilters() {
        return this.checkedFilters;
    },
    setCheckedFilters(checkedFilters) {
        this.checkedFilters = checkedFilters;
        this.trigger("checkedFiltersUpdated");
    },
    getPopoverVisible() {
        return this.popoverVisible;
    },
    setPopoverVisible(popoverVisible) {
        this.popoverVisible = popoverVisible;
        this.trigger("popoverVisibleUpdated");
    },
    getFileIcon(type) {
        switch (type) {
            case "Point":
                return <FontAwesomeIcon icon={["fal", "location"]} />;
            case "Polyline":
                return <FontAwesomeIcon icon={["fal", "arrows-alt-h"]} />;
            case "Polygon":
                return <FontAwesomeIcon icon={["fal", "draw-polygon"]} />;
            case "Ellipse":
                return <FontAwesomeIcon icon={["fal", "circle"]} />;
            case "Free hand":
            case "Free Hand":
                return <FontAwesomeIcon icon={["fal", "tilde"]} />;
            case "Free text":
            case "Free Text":
                return <FontAwesomeIcon icon={["fal", "comment-alt-dots"]} />;
            case "Stamp":
                return <FontAwesomeIcon icon={["fal", "image"]} />;
            case "Arrow":
                return <FontAwesomeIcon icon={["fal", "long-arrow-alt-right"]} />;
            case "x-scale":
                return <FontAwesomeIcon icon={faRulerHorizontal} />;
            case "y-scale":
                return <FontAwesomeIcon icon={faRulerVertical} />;
            case "group":
                return <FontAwesomeIcon icon={faFolder} />;
            case "Reduction":
                return <FontAwesomeIcon icon={["fal", "object-group"]} />;
            case "3DModel":
                return <FontAwesomeIcon icon={["fal", "cube"]} />;
            default:
                return <FontAwesomeIcon icon={["fal", "question"]} />;
        }
    },
    setTreeFilter(treeFilter) {
        AnnotationStore.setAnnotationTableFilter(treeFilter);
        this.treeFilter = treeFilter;
    },
    toggleTreeFilter() {
        this.treeFilter = !this.treeFilter;
        AnnotationStore.setAnnotationTableFilter(this.treeFilter);
        this.trigger("toggleTreeFilter");
    },
    getTreeFilter() {
        return this.treeFilter;
    },

    isSelectAll() {
        return this.selectAll;
    },

    setTreeExpansion(expansionKeysList) {
        this.treeExpansionKeyList = expansionKeysList;
        this.trigger("treeExpansionUpdated");
    },

    getTreeExpansion() {
        return this.treeExpansionKeyList;
    },

    translateToImperialLength(value) {
        if (ProjectsStore.getProjectUnitsByID() === "imperial") {
            return AnnotationStore.toUsValue(value);
        } else {
            return value.toLocaleString(i18n.language, { minimumFractionDigits: 3 }) + " " + i18n.t("meters");
        }
    },

    countChildrenStatuses(children = []) {
        return children.reduce(
            (accumulator, currentValue) => {
                return currentValue.data.type === "group" || currentValue.data.type === "Polygon"
                    ? _.mergeWith(accumulator, currentValue.statuses, (a = 0, b) => a + b)
                    : currentValue.data.status
                    ? { ...accumulator, [currentValue.data.status]: (accumulator[currentValue.data.status] || 0) + 1 }
                    : currentValue.data.xfdf.status
                    ? { ...accumulator, [currentValue.data.xfdf.status]: (accumulator[currentValue.data.xfdf.status] || 0) + 1 }
                    : accumulator;
            },
            { notStarted: 0, progress: 0, review: 0, complete: 0 }
        );
    },

    checkNegativeRows(children = []) {
        return children.reduce(
            (accumulator, currentValue) => {
                return currentValue.hasNegativeRow ? { ...accumulator, hasNegativeRow: true } : accumulator;
            },
            { hasNegativeRow: false }
        );
    },

    parseIdMapToList(idMap, fileId, reductions) {
        let objectsList = [];
        _.forEach(Object.values(idMap), (object) => {
            const listToPush = reductions ? this.parseIdMapToList(object) : Object.values(object);
            objectsList = [...objectsList, ...listToPush];
        });
        return objectsList;
    },

    buildTree(expandedKeys = undefined) {
        let root = [];
        const treeFilter = this.getTreeFilter();
        const nameFilter = HeaderStore.getAppSearch();
        const hashMap = ObjectsStore.getEstimateObjectsHashMap();
        const activeEstimate = AnnotationStore.getActiveEstimate();
        //change this later to get annots from one file or from every file based on treeFilter
        if (!activeEstimate || activeEstimate == -1) return { treeData: [], expandedKeys: [] };
        const { foldersMap, annotationsMap, reductionsMap } = hashMap[activeEstimate.get("id")].objects;
        const annotationList = this.parseIdMapToList(annotationsMap);
        const reductionList = this.parseIdMapToList(reductionsMap, undefined, true);
        const annotsList = [...Object.values(foldersMap), ...annotationList, ...reductionList];
        const selection = ObjectsStore.getSelectionList().selectionKeys;
        const newAnnotInfo = AnnotationStore.getAddedAnnotInfo();
        let uniqueExpandedKeys = new Set(expandedKeys ? expandedKeys : []);
        let parsedTreeRoots = [];

        _.forEach(annotsList, (annot) => {
            if (treeFilter && annot.type !== "group" && !AnnotationStore.jsAnnotationIsOnFileCurrentPage(annot)) return;
            if (nameFilter && annot.type !== "group" && (!annot.name || (annot.name && annot.name.toLowerCase().indexOf(nameFilter.toLowerCase()) == -1)))
                return;

            let treeNode = { title: annot.name, key: annot.id, data: annot };
            if (annot.type === "group" || annot.type === "Polygon") {
                treeNode.folder = true;
            }
            if (annot.type !== "group") {
                treeNode.icon = this.getFileIcon(annot.type);
                treeNode.hasNegativeRow = this.checkNegativeRowsValues(annot.rows);
            }
            parsedTreeRoots.push(treeNode);
        });
        const idMapping = _.reduce(
            parsedTreeRoots,
            (acc, el, i) => {
                const idForSerach = el.data.type === "Polygon" ? el.data.annotationId : el.key;
                acc[idForSerach] = i;
                return acc;
            },
            {}
        );
        const folderMapping = _.reduce(
            annotsList.filter((annot) => annot.type === "group" || annot.type === "Polygon"),
            (acc, el) => {
                const idForSerach = el.type === "Polygon" ? el.annotationId : el.id;
                acc[idForSerach] = { parentChildrens: [], allChildrens: [] };
                return acc;
            },
            { root: { parentChildrens: [] } }
        );
        _.forEach(parsedTreeRoots, (el) => {
            if (!el.data.parentId) {
                folderMapping["root"].parentChildrens.push(el);
                return;
            }
            let parentEl = parsedTreeRoots[idMapping[el.data.parentId]];
            let firstParentFlag = true;

            while (parentEl) {
                if (expandedKeys && selection.includes(el.key)) {
                    uniqueExpandedKeys.add(parentEl.key);
                }
                const destinationIndex = parentEl.data.type === "Polygon" ? parentEl.data.annotationId : parentEl.data.id;
                if (firstParentFlag) {
                    folderMapping[destinationIndex].parentChildrens.push(el);
                }
                folderMapping[destinationIndex].allChildrens.push(el);
                if (parentEl.data.parentId) {
                    parentEl = parsedTreeRoots[idMapping[parentEl.data.parentId]];
                    firstParentFlag = false;
                } else {
                    parentEl = false;
                }
            }
        });
        _.forEach(parsedTreeRoots, (node) => {
            if (node.data.type === "group" || node.data.type === "Polygon") {
                const idForSerach = node.data.type === "Polygon" ? node.data.annotationId : node.data.id;
                const childrens = folderMapping[idForSerach];
                const annotationRows = this.checkNegativeRows(childrens.allChildrens.filter((child) => child.data.type !== "group"));
                node.countedObjects = _.filter(childrens.allChildrens, (child) => child.data.type !== "group").length;
                node.hasNegativeRow = annotationRows.hasNegativeRow;
                node.children = childrens.parentChildrens.sort(this.sortingFunction);
                if (node.data.type === "group") {
                    node.statuses = this.countChildrenStatuses(childrens.allChildrens);
                } else {
                    if (childrens.parentChildrens.length > 0) {
                        let sumarizedStatuses = this.countChildrenStatuses(childrens.parentChildrens);
                        sumarizedStatuses[node.data.status]++;
                        node.statuses = sumarizedStatuses;
                    } else {
                        let statusesForAnnotWithoutReductions = { notStarted: 0, progress: 0, review: 0, complete: 0 };
                        statusesForAnnotWithoutReductions[node.data.status] = 1;
                        node.statuses = statusesForAnnotWithoutReductions;
                    }
                }
            }
            if (!node.data.parentId) {
                root.push(node);
                return;
            }
            const parentEl = parsedTreeRoots[idMapping[node.data.parentId]];
            node.parent = parentEl;
        });
        root = root.sort(this.sortingFunction);

        if (newAnnotInfo?.type === "Reduction") uniqueExpandedKeys.add(newAnnotInfo.id);

        this.folderMapping = folderMapping;
        return { treeData: root, expandedKeys: [...uniqueExpandedKeys] };
    },

    checkNegativeRowsValues(rows) {
        return _.some(_.values(rows), (row) => row.negativeValue);
    },

    clearSelectedAnnotations() {
        ObjectsStore.clearSelection();
    },

    calculateTreeCheck(selectedKeys, data) {
        const isCtrlPressed = data?.nativeEvent?.ctrlKey || data?.nativeEvent?.metaKey;
        const isShiftPressed = data?.nativeEvent?.shiftKey;
        const isAltPressed = data?.nativeEvent?.altKey;
        const shouldSelect = data.selectedNodes.some((item) => item.key === data.node.key);
        if (isShiftPressed && shouldSelect) {
            if (data.node.data.type == ANNOT_TYPES.GROUP) {
                const allFolders = data.selectedNodes.filter((node) => node.data.type == ANNOT_TYPES.GROUP);
                const allFolderChildrens = this.getAllChildrensForFolderArray(allFolders, isAltPressed);
                const mainFoldersToSelect = this.getFoldersSelectionAfterShiftSelect(allFolders, allFolderChildrens);
                const uniqSelection = _.uniqBy(allFolderChildrens, data.id);
                ObjectsStore.selectListOfObjects(uniqSelection, mainFoldersToSelect, true, true);
                return;
            } else {
                const foldersList = data.selectedNodes.filter((node) => node.data.type === ANNOT_TYPES.GROUP);
                const annotsList = data.selectedNodes.filter((node) => node.data.type !== ANNOT_TYPES.GROUP);
                const { objectsToSelect, foldersNotToSelect } = this.getSelectionListAfterShiftSelectAnnot(foldersList, data.selectedNodes, isAltPressed);
                const foldersListToCheck = _.filter(
                    foldersList,
                    (folder) => !_.some(foldersNotToSelect, (notSelectFolder) => notSelectFolder.data.id === folder.data.id)
                );
                const polygonsInShiftSelect = annotsList.filter((annot) => annot.data.type === ANNOT_TYPES.POLYGON);
                const reductions = this.getAllChildrensForPolygonList(polygonsInShiftSelect);
                const newSelection = isAltPressed
                    ? [...objectsToSelect, ...annotsList, ...reductions]
                    : [...objectsToSelect, ...annotsList].filter((obj) => obj.data.type !== ANNOT_TYPES.REDUCTION);
                const allShiftSelectedFolders = this.getAllChildrensForFolderArray(foldersListToCheck).filter((child) => child.data.type === ANNOT_TYPES.GROUP);
                const mainFolders = this.getFoldersSelectionAfterShiftSelect(foldersListToCheck, allShiftSelectedFolders);
                const newSelectionWithoutMainFolders = _.filter(
                    _.uniqBy(newSelection, data.id),
                    (obj) => !_.some(mainFolders, (mainFolder) => mainFolder.data.id === obj.data.id)
                );
                ObjectsStore.selectListOfObjects(newSelectionWithoutMainFolders, mainFolders);
                return;
            }
        }
        if (shouldSelect) {
            if (data.node.data.type === ANNOT_TYPES.GROUP) {
                const allFolderChildrens = this.getAllChildrensForFolder(data.node.data.id, isAltPressed);
                if (isCtrlPressed) {
                    const mainFoldersToUnselect = this.getMainFoldersNestedInNewSelectedFolder(allFolderChildrens);
                    if (mainFoldersToUnselect.length) ObjectsStore.deselectMainFolders(mainFoldersToUnselect);
                }
                ObjectsStore.selectListOfObjects(allFolderChildrens, [data.node], isCtrlPressed);
            } else {
                if (data.node.data.type == ANNOT_TYPES.POLYGON && isAltPressed) {
                    const allPolygonChildrens = this.getAllChildrensForPolygon(data.node.data.annotationId);
                    ObjectsStore.selectListOfObjects([data.node, ...allPolygonChildrens], [], isCtrlPressed);
                } else {
                    ObjectsStore.selectAnnotation(data.node.data, isCtrlPressed);
                }
            }
        } else {
            ObjectsStore.deselectAnnotation(data.node.data);
        }
    },

    getAllChildrensForFolder(id, isAltPressed) {
        const treeFolderMapping = this.getFolderMapping();
        const allFolderChildrens = treeFolderMapping[id].allChildrens;

        return isAltPressed ? allFolderChildrens.filter((annot) => annot.data.type !== ANNOT_TYPES.REDUCTION) : allFolderChildrens;
    },

    getAllChildrensForFolderArray(foldersList, isAltPressed) {
        let childrensList = [];
        _.forEach(foldersList, (folder) => {
            const id = folder.data ? folder.data.id : folder.id;
            const folderChilds = this.getAllChildrensForFolder(id, isAltPressed);
            childrensList = [...childrensList, ...folderChilds];
        });

        return childrensList;
    },

    getAllChildrensForPolygon(annotId) {
        const treeFolderMapping = this.getFolderMapping();
        return treeFolderMapping[annotId].parentChildrens;
    },

    getAllChildrensForPolygonList(polygons) {
        let reductionsList = [];
        _.forEach(polygons, (polygon) => {
            const reductions = this.getAllChildrensForPolygon(polygon.data.annotationId);
            reductionsList = [...reductionsList, ...reductions];
        });
        return reductionsList;
    },

    getFoldersSelectionAfterShiftSelect(foldersToCheck, foldersAllChildrens) {
        const newMainFolders = [];
        _.forEach(foldersToCheck, (folder) => {
            const folderId = folder.data ? folder.data.id : folder.id;
            const standardSelect = _.some(foldersAllChildrens, (children) => children.data.id === folderId);
            if (!standardSelect) newMainFolders.push(folder);
        });
        return newMainFolders;
    },

    getMainFoldersNestedInNewSelectedFolder(listToCheck) {
        const selection = ObjectsStore.getSelectionState();
        const actualMainFolders = Object.values(selection.mainFolders);
        const foldersToCheck = _.filter(listToCheck, (obj) => obj.data.type === ANNOT_TYPES.GROUP);
        const mainFoldersToUnselect = [];
        _.forEach(foldersToCheck, (childrenToCheck) => {
            if (actualMainFolders.some((folder) => folder.id === childrenToCheck.data.id)) mainFoldersToUnselect.push(childrenToCheck.data);
        });
        return mainFoldersToUnselect;
    },

    getSelectionListAfterShiftSelectAnnot(foldersList, selectedNodes, isAltPressed) {
        const treeFolderMapping = this.getFolderMapping();
        let objectsToSelect = [];
        const foldersNotToSelect = [];

        _.forEach(foldersList, (folder) => {
            const folderChilds = treeFolderMapping[folder.data.id].parentChildrens;
            if (folderChilds.length) {
                const childsInShiftSelect = selectedNodes.filter((node) => node.data.parentId == folder.data.id);
                if (childsInShiftSelect.length == 0) {
                    //folder closed
                    const childsToSelect = this.getAllChildrensForFolder(folder.data.id, !isAltPressed);
                    objectsToSelect = [...objectsToSelect, folder, ...childsToSelect];
                    return;
                }
                const annotsInShiftSelect = childsInShiftSelect.filter((child) => child.data.type !== ANNOT_TYPES.GROUP);
                const annotsInFolderChilds = folderChilds.filter((child) => child.data.type !== ANNOT_TYPES.GROUP);
                if (annotsInShiftSelect.length === annotsInFolderChilds.length) {
                    objectsToSelect.push(folder);
                } else {
                    foldersNotToSelect.push(folder);
                }
            } else {
                objectsToSelect.push(folder);
            }
        });

        return { objectsToSelect, foldersNotToSelect };
    },

    setTreeRef(treeRef) {
        this.treeRef = treeRef;
    },
    getTreeRef() {
        return this.treeRef;
    },
    isBranchParentSelected(node, checkedNodes) {
        if (node.parent === -1) return false;
        while (node.parent && checkedNodes) {
            node = node.parent;
            if (checkedNodes.find((tmpNode) => tmpNode.data.id === node.data.id)) {
                return true;
            }
        }
        return false;
    },
    getAnnotationSortingMode() {
        if (!localStorage.getItem("annotationTreeSorting")) {
            localStorage.setItem("annotationTreeSorting", "type-number-name");
        }
        return localStorage.getItem("annotationTreeSorting");
    },
    sortingFunction(a1, b1) {
        // Pree sort for scale and group
        const a = a1?.data;
        const b = b1?.data;
        if (a && !b) {
            return -1;
        } else if (!a && b) {
            return 1;
        }
        if (!a && !b) {
            return 0;
        }
        const pree2 = sortOrder[a.type.replace(" ", "")];
        const pree1 = sortOrder[b.type.replace(" ", "")];
        if (pree1 <= 0 || pree2 <= 0) {
            if (pree1 > pree2) {
                return -1;
            }
            if (pree1 < pree2) {
                return 1;
            }
            //return 0;
        }

        const sortCase = this.getAnnotationSortingMode();

        switch (sortCase) {
            case "type-number-name": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                return 0;
            }
            case "type-name-number": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                return 0;
            }
            case "number-name-type": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                return 0;
            }
            case "number-type-name": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                return 0;
            }
            case "name-number-type": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                return 0;
            }
            case "name-type-number": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                return 0;
            }
            case "type-number": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                return 0;
            }
            case "type-name": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                return 0;
            }
            case "number-type": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                return 0;
            }
            case "number-name": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                return 0;
            }
            case "name-type": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                return 0;
            }
            case "name-number": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                return 0;
            }
            case "type": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                const s1 = sortOrder[a.type.replace(" ", "")];
                const s2 = sortOrder[b.type.replace(" ", "")];
                if (s1 > s2) {
                    return 1;
                }
                if (s1 < s2) {
                    return -1;
                }
                return 0;
            }
            case "number": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.number && b.number) {
                    const numberCompare = a.number.localeCompare(b.number, undefined, { numeric: true });
                    if (numberCompare && numberCompare !== 0) {
                        return numberCompare;
                    }
                }
                return 0;
            }
            case "name": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.name && b.name) {
                    const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true });
                    if (nameCompare && nameCompare !== 0) {
                        return nameCompare;
                    }
                }
                return 0;
            }
            case "status": {
                if (a && !b) {
                    return -1;
                } else if (!a && b) {
                    return 1;
                }
                if (!a && !b) {
                    return 0;
                }
                if (a.status && b.status) {
                    const sortStatusOrder = ["notStarted", "progress", "review", "complete"];
                    return sortStatusOrder.indexOf(a.status) - sortStatusOrder.indexOf(b.status);
                }
                return 0;
            }
            default:
                break;
        }
    },
    onDrop(selectedData, data) {
        let dropNode = data.node.data;
        if (data.node.data?.type !== "group" && data.node.parent) dropNode = data.node.parent.data;
        const parser = new DOMParser();
        let moveList = new Immutable.List();
        let notToMoveAnnotIdList = new Set();

        if (selectedData.length > 0) {
            selectedData.map((item) => {
                if (item.id !== data.node.data.id) {
                    if (item.type === "3DModel") {
                        moveList = moveList.push(Immutable.fromJS(item));
                        return;
                    }
                    if (item.type === "group") {
                        const folderMapping = this.getFolderMapping();
                        const childrenIds = _.map(folderMapping[item.id].allChildrens, (child) => child.data.id);
                        notToMoveAnnotIdList = new Set([...notToMoveAnnotIdList, ...childrenIds]);
                        moveList = moveList.push(Immutable.fromJS(item));
                    } else {
                        if (item.type === "Reduction") return;
                        const xfdfElements = parser.parseFromString(item.xfdf, "text/xml");
                        const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                        if (annotElement.getAttribute("readOnly") !== "true") {
                            moveList = moveList.push(Immutable.fromJS(item));
                        }
                    }
                }
            });
        } else {
            const item = data.dragNode.data;

            if (item.id !== data.node.data.id) {
                if (item.type === "group") {
                    const folderMapping = this.getFolderMapping();
                    const childrenIds = _.map(folderMapping[item.id].allChildrens, (child) => child.data.id);
                    notToMoveAnnotIdList = new Set([...notToMoveAnnotIdList, ...childrenIds]);
                    moveList = moveList.push(Immutable.fromJS(item));
                } else if (item.type === "3DModel") {
                    if (!item.xfdf.readOnly) moveList = moveList.push(Immutable.fromJS(item));
                } else {
                    const xfdfElements = parser.parseFromString(item.xfdf, "text/xml");
                    const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                    if (annotElement.getAttribute("readOnly") !== "true") {
                        moveList = moveList.push(Immutable.fromJS(item));
                    }
                }
            }
        }
        const requestMoveList = moveList.filter((annot) => [...notToMoveAnnotIdList].every((id) => id !== annot.get("id")));
        const requestMoveListIds = requestMoveList.map((annot) => annot.get("id")).toJS();
        if (dropNode.type === "group") {
            let parentId = data.dropPosition === -1 ? dropNode?.parentId?.toString() || null : dropNode?.id?.toString() || null;
            return NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
                action: ANNOTATION_ACTION_NAME.UPDATE,
                ids: requestMoveListIds,
                parameter: "parentId",
                value: parentId,
            });
        }
        if (data.node.parent) {
            return NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
                action: ANNOTATION_ACTION_NAME.UPDATE,
                ids: requestMoveListIds,
                parameter: "parentId",
                value: data.node.parent.data.id,
            });
        }
        if (requestMoveListIds.length > 0)
            return NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
                action: ANNOTATION_ACTION_NAME.UPDATE,
                ids: requestMoveListIds,
                parameter: "parentId",
                value: null,
            });
    },
});
