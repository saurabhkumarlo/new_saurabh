import "./bimer-viewer.less";

import { AnnotationStore, IfcStore } from "../../stores";
import { CalculationActions, ProjectActions } from "../../actions";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

const BIMerViewer = forwardRef(
    (
        {
            modelUrl,
            loadingProgressCallback = () => {},
            missingWebGlCallback = (error) => {
                console.log("WebGL error: ", error);
            },
            projectId,
            tree,
            openLinkingModal,
            isActiveCalculate,
        },
        ref
    ) => {
        const previewRef = useRef();
        const [actions, setActions] = useState(undefined);
        const { t } = useTranslation();

        useEffect(() => {
            AnnotationStore.initValueInheritance(projectId);
            IfcStore.initValueInheritance();
            if (!AnnotationStore.isAnnotationActionDone()) {
                ProjectActions.requestOpenProject(projectId);
                ProjectActions.requestProject(projectId);
            }
        }, []);

        const searchTree = (item, matchingKey) => {
            const getNodes = (result, object) => {
                if (object.key === matchingKey) {
                    result.push(object);
                    return result;
                }
                if (Array.isArray(object.children)) {
                    const children = object.children.reduce(getNodes, []);
                    if (children.length) result.push({ ...object, children });
                }
                return result;
            };

            return item.reduce(getNodes, []);
        };

        useEffect(() => {
            //  eslint-disable-next-line no-undef
            const measuresExtension = new BimerIfcViewer.measures.MeasuresExtension({
                rendererOptions: {
                    enabledByDefault: true,
                    drawVerticesLabels: true,
                    complexElementThreshold: 1000,
                    complexElementLabel: t("BIMER.ELEMENT_IS_TO_COMPLEX"),
                },
            });
            //  eslint-disable-next-line no-undef
            const sceneContainer = new BimerIfcViewer.lib.SceneContainer(previewRef.current, "en", [measuresExtension]);

            sceneContainer.loadModel(
                modelUrl,
                (actions) => {
                    actions.addEventListener("model-element-selected", (obj) => {
                        if (isActiveCalculate) {
                            const selectedObject = searchTree(tree, obj.uuid)[0].children[0].children[0];
                            IfcStore.setSelectedObject(selectedObject);
                            if (IfcStore.getLinkState() && IfcStore.canLinkObejct()) openLinkingModal();
                        }
                    });
                    actions.addEventListener("model-element-unselected", () => {
                        IfcStore.setSelectedObject({});
                    });
                    setActions(actions);
                    IfcStore.setActions(actions);
                },
                loadingProgressCallback,
                missingWebGlCallback
            );
        }, [modelUrl, tree, previewRef]);

        useImperativeHandle(
            ref,
            () => ({
                freeOrbit: () => {
                    actions && actions.freeOrbit();
                },
                pan: () => {
                    actions && actions.pan();
                },
                zoom: () => {
                    actions && actions.zoom();
                },
                firstPerson: () => {
                    actions && actions.firstPerson();
                },
                reset: () => {
                    actions && actions.reset();
                },
                toggleFullscreen: () => {
                    actions && actions.toggleFullscreen();
                },
                getAvailableFilterTypes: () => (actions !== undefined ? actions.getAvailableFilterTypes() : []),
                explode: (value) => {
                    actions && actions.explode(value);
                },
                clip: (value) => {
                    actions && actions.clip(value);
                },
                applyFilter: (type, enable) => {
                    actions && actions.applyFilter(type, enable);
                },
                calculateElementMeasures: (uuid, callback) => {
                    actions && actions.calculateElementMeasures(uuid, callback);
                },
            }),
            [actions]
        );

        return (
            <div className="Bimerifc_Container">
                <div className="bimerifc-scene-container" ref={previewRef} />
            </div>
        );
    }
);

export default BIMerViewer;
