import React from "react";
import { AnnotationStore, AuthenticationStore, EstimateStore } from "stores";
import { annotTypesWithAspectRatio, arePropsEqual, getAttributesValue, getSelectedAnnotations, isScaleSelected } from "../../CalculateProperties.utils";
import { Input, Toggle, TreeSelect } from "../../components";
import _ from "lodash";
import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";

const Edit = ({ selectedAnnotations, mainFoldersList, onChangeValues, onFolderChanged, isPreventEditing }) => {
    const selectedAnnotsWithoutFolders = getSelectedAnnotations(selectedAnnotations, true, false);

    const onUpdate = (value, obj) => {
        switch (obj) {
            case ANNOT_ATTRIBUTES.NUMBER:
            case ANNOT_ATTRIBUTES.NAME:
                if (mainFoldersList.length) selectedAnnotations = getSelectedAnnotations(mainFoldersList, true, true);
                else selectedAnnotations = getSelectedAnnotations(selectedAnnotations, false, false);
                break;
            case ANNOT_ATTRIBUTES.READ_ONLY:
                selectedAnnotations = getSelectedAnnotations(selectedAnnotations, true);
                break;
            case ANNOT_ATTRIBUTES.ASPECT_RATIO:
                selectedAnnotations = getSelectedAnnotations(selectedAnnotations, false, false, annotTypesWithAspectRatio);
                break;
            default:
                selectedAnnotations = getSelectedAnnotations(selectedAnnotations, false);
                break;
        }
        onChangeValues(selectedAnnotations, value, obj);
    };

    const getFolderItems = (list) => {
        const comparatorWithNrTag = (a, b) => {
            const title1 = a[ANNOT_ATTRIBUTES.NUMBER].concat(" ", a.title);
            const title2 = b[ANNOT_ATTRIBUTES.NUMBER].concat(" ", b.title);
            return title1.toString().localeCompare(title2.toString(), "en", { numeric: true });
        };
        const comparatorWithoutNrTag = (a, b) => {
            const title1 = a.title;
            const title2 = b.title;
            return title1.toString().localeCompare(title2.toString(), "en", { numeric: true });
        };
        const sortedList = [
            ...list.filter((e) => !e[ANNOT_ATTRIBUTES.NUMBER]).sort(comparatorWithoutNrTag),
            ...list.filter((e) => e[ANNOT_ATTRIBUTES.NUMBER]).sort(comparatorWithNrTag),
        ];

        return sortedList.map((folder) => {
            const title = "".concat(folder[ANNOT_ATTRIBUTES.NUMBER] || "", " ", folder.title);
            const key = folder.key === "root" ? folder.key : folder.id.toString();
            if (folder.children) {
                return { title, key, children: getFolderItems(folder.children) };
            } else {
                return { title, key };
            }
        });
    };

    return (
        <>
            {!isScaleSelected() && (
                <>
                    <TreeSelect
                        label="GENERAL.FOLDER"
                        value={AnnotationStore.getPathForAnnotationHandler(selectedAnnotations)}
                        data={getFolderItems(AnnotationStore.getMoveFolderTree())}
                        onUpdate={onFolderChanged}
                        disabled={isPreventEditing}
                    />
                    <div className="properties-pane-row">
                        <Input
                            label="ESTIMATE.NR_TAG"
                            obj={ANNOT_ATTRIBUTES.NUMBER}
                            value={getAttributesValue(selectedAnnotations, ANNOT_ATTRIBUTES.NUMBER)}
                            onUpdate={onUpdate}
                            textAlign="center"
                            style={{ maxWidth: 100, width: "50%" }}
                            disabled={isPreventEditing}
                        />
                        <Input
                            label="GENERAL.NAME"
                            obj={ANNOT_ATTRIBUTES.NAME}
                            value={getAttributesValue(selectedAnnotations, ANNOT_ATTRIBUTES.NAME)}
                            onUpdate={onUpdate}
                            disabled={isPreventEditing}
                        />
                    </div>
                </>
            )}

            <Toggle
                label="ESTIMATE.LOCK_OBJECT"
                obj={ANNOT_ATTRIBUTES.READ_ONLY}
                value={getAttributesValue(selectedAnnotsWithoutFolders, ANNOT_ATTRIBUTES.READ_ONLY)}
                onUpdate={onUpdate}
                disabled={EstimateStore.getActiveEstimate()?.locked || !AuthenticationStore.getRole()}
            />
            {getSelectedAnnotations(selectedAnnotations, true, false, annotTypesWithAspectRatio).length > 0 && (
                <Toggle
                    label="ESTIMATE.LOCK_ASPECT_RATIO"
                    obj={ANNOT_ATTRIBUTES.ASPECT_RATIO}
                    value={getAttributesValue(selectedAnnotsWithoutFolders, ANNOT_ATTRIBUTES.ASPECT_RATIO)}
                    onUpdate={onUpdate}
                    disabled={isPreventEditing}
                />
            )}
            <Toggle
                label="ESTIMATE.HIDDEN"
                obj={ANNOT_ATTRIBUTES.HIDDEN}
                value={getAttributesValue(selectedAnnotsWithoutFolders, ANNOT_ATTRIBUTES.HIDDEN)}
                onUpdate={onUpdate}
                disabled={isPreventEditing}
            />
        </>
    );
};

export default React.memo(Edit, (prevProps, nextProps) => arePropsEqual(prevProps.selectedAnnotations, nextProps.selectedAnnotations));
