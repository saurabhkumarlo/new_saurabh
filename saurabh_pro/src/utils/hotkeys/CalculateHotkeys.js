import { AnnotationActions } from "actions";
import { AnnotationStore, IfcStore, ProjectsStore, RowCopyStore, CopyStore, AuthenticationStore, TreeStoreV2, ObjectsStore } from "stores";
import AnnotationDeleteHandler from "utils/AnnotationDeleteHandler";
import { areAnnotsLocked } from "../../calculate/calculate/components/CalculateProperties/CalculateProperties.utils";
import { TOOLS } from "components/BIMer/toolbar.utils";
import { isInputFocused } from "./hotkeys.utils";
import { handleGlobalKeyDown } from "./GlobalHotkeys";
import _ from "lodash";
export const handleCalculateMouseDown = (event) => {
    const { button } = event;
    const isActiveIfcFile = AnnotationStore.isActiveIfcFile();
    const panTool = AnnotationStore.WebViewer.docViewer.getTool(AnnotationStore.WebViewer.Tools.ToolNames.PAN);

    switch (button) {
        case 1: // SCROLL CLICK
            if (!isActiveIfcFile) {
                event.preventDefault();
                event.stopPropagation();
                AnnotationStore.setToolMode("Pan", true);
                panTool.mouseLeftDown(event);
            }
            break;
        default:
            break;
    }
};

export const handleDoubleClick = () => {
    setTimeout(() => {
        if (AnnotationStore.getSelectedAnnotationIds()) {
            const selectedAnnotationId = AnnotationStore.getSelectedAnnotationIds()?.first()?.getIn(["id"]);
            if (selectedAnnotationId) {
                TreeStoreV2.getTreeRef().current.scrollTo({ key: selectedAnnotationId, align: "top", offset: 60 });
            }
        }
    }, 100);
};

export const handleCalculateMouseUp = (event) => {
    const { button } = event;
    const isActiveIfcFile = AnnotationStore.isActiveIfcFile();
    const panTool = AnnotationStore.WebViewer.docViewer.getTool(AnnotationStore.WebViewer.Tools.ToolNames.PAN);
    switch (button) {
        case 1: // SCROLL CLICK
            if (!isActiveIfcFile) {
                event.preventDefault();
                event.stopPropagation();
                panTool.mouseLeftUp(event);
                AnnotationStore.backToPreviousToolMode();
            }
            break;
        default:
            break;
    }
};

export const handleAnnotationStoreKeyUp = (event) => {
    const { key, keyCode } = event;
    const isActiveIfcFile = AnnotationStore.isActiveIfcFile();

    if (key === "Control") {
        AnnotationStore.setIsCtrlPressed(false);
    }

    switch (keyCode) {
        case 32: // SPACE
            if (!isActiveIfcFile) {
                AnnotationStore.backToPreviousToolMode();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        default:
            break;
    }
};

export const handleCalculateKeyDown = (event) => {
    const role = AuthenticationStore.getRole();
    const { keyCode, ctrlKey, altKey, shiftKey } = event;
    const deleteHandler = new AnnotationDeleteHandler();
    const selectedAnnotations = ObjectsStore.getSelectionList().selectionList;
    const isActiveIfcFile = AnnotationStore.isActiveIfcFile();

    if (ctrlKey) AnnotationStore.setIsCtrlPressed(true);

    if (isInputFocused(event)) return;

    handleGlobalKeyDown(event);

    switch (keyCode) {
        case 27: // Esc
            AnnotationStore.handleEscapeButtonInCalculate();
            break;
        case 48:
        case 96: // 0
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreateScale");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && !isActiveIfcFile) {
                AnnotationStore.setFitToScreen();
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.onResetView();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 49:
        case 97: // 1
            if (ctrlKey && altKey) {
                AnnotationStore.changeAnnotsStatus("notStarted");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && shiftKey) {
                AnnotationStore.onToggleDocument();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile) {
                AnnotationStore.setToolMode("AnnotationEdit");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.FREE_ORBIT);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 50:
        case 98: // 2
            if (ctrlKey && altKey) {
                AnnotationStore.changeAnnotsStatus("progress");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && shiftKey) {
                AnnotationStore.onToggleRows();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreatePoint");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.PAN);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 51:
        case 99: // 3
            if (ctrlKey && altKey) {
                AnnotationStore.changeAnnotsStatus("review");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && shiftKey) {
                AnnotationStore.onToggleProperties();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreatePolyline");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.ZOOM);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 52:
        case 100: // 4
            if (ctrlKey && altKey) {
                AnnotationStore.changeAnnotsStatus("complete");
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && shiftKey && !AnnotationStore.isReductionToolDisabled() && role) {
                AnnotationStore.setToolMode("AnnotationCreateReduction");
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreatePolygon");
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && isActiveIfcFile) {
                IfcStore.setActiveTool(TOOLS.FIRST_PERSON);
                IfcStore.onChangeActiveTool();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 53:
        case 101: // 5
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreateEllipse");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 54:
        case 102: // 6
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreateFreeHand");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 55:
        case 103: // 7
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreateFreeText");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 56:
        case 104: // 8
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreateStamp");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 57:
        case 105: // 9
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.setToolMode("AnnotationCreateArrow");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 78: // N
            if (ctrlKey && altKey && role) {
                AnnotationActions.requestAnnotationFolderCreate("Folder");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 71: // G
            if (ctrlKey && !isActiveIfcFile) {
                AnnotationStore.toggleSnapon1();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 46: // DELETE
            const annotsLists = AnnotationStore.getAnnotationsLists();
            if (shiftKey) {
                if (annotsLists.readOnlyList.length) {
                    AnnotationStore.toggleDeleteModal();
                    event.preventDefault();
                    event.stopPropagation();
                } else if (annotsLists.readWriteList.length) {
                    deleteHandler.deleteAnnotations(annotsLists.readWriteList);
                    TreeStoreV2.clearSelectedAnnotations();
                    event.preventDefault();
                    event.stopPropagation();
                }
            } else {
                if (annotsLists.readWriteList.length || annotsLists.readOnlyList.length) {
                    AnnotationStore.toggleDeleteModal();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            break;
        case 90: // Z
            if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.undoDrawing(event);
                event.preventDefault();
                event.stopPropagation();
            } else if (altKey && !isActiveIfcFile) {
                AnnotationStore.setToolMode("MarqueeZoomTool");
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 65: // A
            if (ctrlKey && shiftKey) {
                TreeStoreV2.clearSelectedAnnotations();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey) {
                AnnotationStore.selectAll(altKey);
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 69: // E
            if (ctrlKey && altKey) {
                AnnotationStore.expandAll();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey) {
                AnnotationStore.onShowFileExportModal();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 70: // F
            if (ctrlKey && shiftKey) {
                TreeStoreV2.toggleTreeFilter();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 87: // W
            if (ctrlKey && altKey) {
                TreeStoreV2.setTreeExpansion([]);
                localStorage.setItem(`expandedKeys_${ProjectsStore.getActiveProjectId()}`, JSON.stringify([]));
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 76: // L
            if (ctrlKey && shiftKey && role) {
                const initialValue = areAnnotsLocked(selectedAnnotations);
                const annotsToUpdate = selectedAnnotations.filter((annot) => annot.get("type") !== "group").toJS();
                if (annotsToUpdate.length > 0) {
                    AnnotationStore.onRequestAnnotationUpdate({
                        annots: annotsToUpdate,
                        key: "readOnly",
                        value: !initialValue,
                    });
                }
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 113: // F2
            if (role) {
                AnnotationStore.onFocusNameInput();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 114: // F3
            if (role) {
                AnnotationStore.onFocusNrTagInput();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 115: // F4
            if (role) {
                event.preventDefault();
                event.stopPropagation();
                AnnotationStore.onShowFillColour();
            }
            break;
        case 116: // F5
            if (role) {
                event.preventDefault();
                event.stopPropagation();
                AnnotationStore.onShowBorderColour();
            }
            break;
        case 120: // F9
            if (!isActiveIfcFile && role) {
                AnnotationStore.onShowTiles();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 121: // F10
            if (!isActiveIfcFile && role) {
                AnnotationStore.onShowAngles();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 67: // C
            if (ctrlKey && shiftKey && altKey && selectedAnnotations.size > 0 && role) {
                CopyStore.copyAnnotationProperties();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && altKey && selectedAnnotations.size > 0 && role) {
                CopyStore.copyAnnotationStyles();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && shiftKey && selectedAnnotations.size > 0 && role) {
                RowCopyStore.copyAnnotationRows(selectedAnnotations);
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.copyAnnotations();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 86: // V
            if (ctrlKey && shiftKey && altKey && CopyStore.getPropertiecCopy().size > 0 && selectedAnnotations.size > 0 && role) {
                CopyStore.pasteAnnotationProperties(selectedAnnotations);
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && altKey && CopyStore.getStylesCopy().size > 0 && selectedAnnotations.size > 0 && role) {
                CopyStore.pasteAnnotationStyles(selectedAnnotations);
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && shiftKey && RowCopyStore.getCopyAnnotationRows().length > 0 && selectedAnnotations.size > 0 && role) {
                //rework isEstimateLocked
                //} else if (ctrlKey && shiftKey && RowCopyStore.getCopyAnnotationRows().length > 0 && selectedAnnotations.size > 0 && role && !isEstimateLocked) {
                RowCopyStore.pasteAnnotationRows(selectedAnnotations);
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.pasteAnnotations();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 68: // D
            if (ctrlKey && shiftKey && role) {
                AnnotationStore.onshowReplaceRowsConfirmation();
                event.preventDefault();
                event.stopPropagation();
            } else if (ctrlKey && !isActiveIfcFile && role) {
                AnnotationStore.copyAnnotations();
                AnnotationStore.pasteAnnotations();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 80: // P
            if (ctrlKey && !isActiveIfcFile) {
                AnnotationStore.printDocumentToPdf();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 38: // ArrowUp
        case 40: // ArrowDown
        //REWORK SELECTION
        // const arrowDirection = keyCode === 38 ? "ArrowUp" : "ArrowDown";
        // const data = AnnotationStore.getAllKeysAndNodes(TreeStoreV2.buildTree().treeData);
        // const selectedKeys = TreeStore.getTreeSelection();
        // const index = _.indexOf(data.keys, selectedKeys[selectedKeys.length - 1]);
        // const keyIdex = arrowDirection === "ArrowUp" ? index - 1 : index + 1;

        // if (altKey && !isActiveIfcFile) {
        //     arrowDirection === "ArrowUp" ? AnnotationStore.zoomInPDF() : AnnotationStore.zoomOutPDF();
        //     event.preventDefault();
        //     event.stopPropagation();
        // }
        // if (data.keys[keyIdex]) {
        //     TreeStore.setTreeSelection([data.keys[keyIdex]]);
        //     AnnotationStore.triggerAnnotationSelected();
        //     TreeStore.getTreeRef().current.scrollTo({ key: data.keys[keyIdex] });
        //     let link = document.getElementById(`treeList_${data.keys[keyIdex]}`);
        //     if (link) link.click();
        // }
        // break;
        case 37: // ArrowLeft
            if (altKey && !isActiveIfcFile) {
                AnnotationStore.rotateLeftPDF();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 39: // ArrowRight
            if (altKey && !isActiveIfcFile) {
                AnnotationStore.rotatePDF();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        case 82: // R
            if (altKey && !isActiveIfcFile) {
                AnnotationStore.rotatePDF();
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        default:
            break;
    }
};

export const handleAnnotationStoreKeyDown = (event) => {
    const { keyCode } = event;
    const isActiveIfcFile = AnnotationStore.isActiveIfcFile();

    switch (keyCode) {
        case 32: // SPACE
            if (!isActiveIfcFile) {
                AnnotationStore.setToolMode("Pan", true);
                event.preventDefault();
                event.stopPropagation();
            }
            break;
        default:
            break;
    }
};
