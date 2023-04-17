const getNodesPositions = (obj, { nodeToDelete, selectedNode }) => {
    let temp = 0;
    if (!obj.parentId) obj.pos = "0";
    if (obj.children) {
        obj.children.forEach((children) => {
            const pos = `${obj.pos}-${temp}`;
            children.pos = pos;
            if (children.key === nodeToDelete.key) nodeToDelete.pos = pos;
            if (children.key === selectedNode.key) selectedNode.pos = pos;
            temp++;
        });
    }
    if (nodeToDelete.pos.length > 0 && selectedNode.pos.length > 0) return;
    obj.children.forEach((children) => {
        if (children.type === "folder") getNodesPositions(children, { nodeToDelete, selectedNode });
    });
};

const getTreeNodesPositionsForDeletation = ([obj], nodesDetails) => {
    let treeCopy = {};
    if (obj) {
        try {
            treeCopy = JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.log(error);
        }
        getNodesPositions(treeCopy, nodesDetails);
    }
};

const shouldChangeSelectedNode = ({ nodeToDelete, selectedNode }) => {
    const nodeForDeletePosArr = nodeToDelete.pos.split("-");
    const selectedNodePosArr = selectedNode.pos.split("-");
    if (nodeForDeletePosArr.length < selectedNodePosArr.length) return nodeForDeletePosArr.every((pos, index) => pos === selectedNodePosArr[index]);
    return false;
};

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

    return [item].reduce(getNodes, []);
};

export const shouldChangeSelectedNodeBeforeDeletation = (treeData, selectedNode, checkedItems) => {
    const nodesForDeletationData = {
        nodeToDelete: {
            key: checkedItems[0].key,
            pos: "",
        },
        selectedNode: {
            key: selectedNode.key,
            pos: "",
        },
    };
    getTreeNodesPositionsForDeletation(treeData, nodesForDeletationData);
    return shouldChangeSelectedNode(nodesForDeletationData);
};

export const getAllKeys = (item) =>
    item.reduce((acc, item) => {
        acc.push(item.key);

        if (item.children) {
            acc.push(...getAllKeys(item.children));
        }

        return acc;
    }, []);

export const checkIfShouldUpdateFolderPosition = (dragNode, toNode) => {
    const isInTree = searchTree(dragNode, toNode.key);
    return isInTree.length < 1;
};

export const checkIfShouldUpdateFolderArrPosition = (folderArr, toNode) => {
    if (folderArr.some((folder) => folder.pos === toNode.pos)) return false;
    const shouldUpdateArr = [];
    folderArr.map((folder) => shouldUpdateArr.push(checkIfShouldUpdateFolderPosition(folder, toNode)));
    return shouldUpdateArr.every(Boolean);
};

export const sortTree = (data) => {
    const innerSortTree = (a, b) => a.title.localeCompare(b.title);

    const sortObject = (obj) => {
        if (obj.children) {
            obj.children.map((item) => sortObject(item));

            obj.children.sort(innerSortTree);
        }
    };

    if (Array.isArray(data)) {
        data.map((item) => {
            return sortObject(item);
        });
    }

    return data;
};
