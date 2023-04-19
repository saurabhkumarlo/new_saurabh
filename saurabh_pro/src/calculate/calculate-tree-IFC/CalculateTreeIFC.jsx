import React from "react";
import { Tree } from "antd";
import { isEmpty } from "lodash";

import "./calculate-tree-ifc.less";
import { AnnotationStore, IfcStore, TreeStoreV2 } from "../../stores";

const CalculateTreeIFC = ({ treeData, openLinkingModal, selectedKeys }) => {
    const onSelectItem = async (uuid, data) => {
        const annotationTreeData = AnnotationStore.getAnnotations().toJS();
        const selectedAnnotation = annotationTreeData.find(
            (item) => item.type !== "group" && item.xfdf.uuid === data.node.key && item.geoFile.id === AnnotationStore.getActiveFileId()
        );
        if (selectedAnnotation) {
            const annot = {
                data: selectedAnnotation,
                icon: selectedAnnotation.icon,
                key: selectedAnnotation.key,
                parent: selectedAnnotation.parent,
                title: selectedAnnotation.title,
            };
            const dataToSelect = { node: annot, selectedNodes: [annot] };

            await TreeStoreV2.calculateTreeCheck([selectedAnnotation.id], dataToSelect);
        }
        IfcStore.setSelectedObjectFromTree(uuid, data);
        if (IfcStore.getLinkState() && IfcStore.canLinkObejct() && data.node.isLeaf) openLinkingModal();
        else if (!selectedAnnotation) {
            TreeStoreV2.clearSelectedAnnotations();
        }
        if (uuid.length === 0 && data.node.parentId) IfcStore.setSelectedObjectFromTree([data.node.parentId]);
    };

    return (
        <div className="Ifc_Tree">
            <label className="Ifc_Tree_Title">Model structure</label>
            {!isEmpty(treeData) && (
                <Tree
                    treeData={treeData}
                    autoExpandParent
                    showIcon
                    onSelect={(uuid, data) => onSelectItem(uuid, data)}
                    selectedKeys={selectedKeys}
                    expandedKeys={selectedKeys}
                    blockNode
                />
            )}
        </div>
    );
};

export default CalculateTreeIFC;
