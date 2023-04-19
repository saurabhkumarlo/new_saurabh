import FileStore from "../stores/FileStore";

export const getActiveFileFolderPath = (activeFileId) => {
    const treeData = getMappedTreeData();
    const treeViewNestedPath = getTreeViewNestedPath(treeData, activeFileId);
    const treeViewPathFlatArray = flattenNestedPath(treeViewNestedPath[0])[0];
    const treeViewPathFlatArrayFoldersOnly = removeFileNameFromPath(treeViewPathFlatArray);

    return treeViewPathFlatArrayFoldersOnly;
};

const getMappedTreeData = () => {
    const rootFolder = FileStore.getRootFolder();
    if (rootFolder) return [mapTreeData(rootFolder)];
};

const removeFileNameFromPath = (array = []) => {
    array.pop();
    return array;
};

const flattenNestedPath = (item, path = [], result = []) => {
    if (item) {
        if (item.children) {
            for (const child of item.children) {
                flattenNestedPath(child, path.concat(item.title), result);
            }
        } else {
            result.push(path.concat(item.title));
        }
    }

    return result;
};

const getTreeViewNestedPath = (tree = [], fileId) => {
    return tree.reduce((acc, item) => {
        if (item.key === fileId) {
            acc.push(item);
        } else if (item.children && item.children.length > 0) {
            const newItems = getTreeViewNestedPath(item.children, fileId);

            if (newItems.length > 0) {
                acc.push({ ...item, children: newItems });
            }
        }

        return acc;
    }, []);
};

const mapTreeData = (folder) => {
    const children = FileStore.getChildren(folder.id);

    let data = {
        title: folder.name,
        key: folder.id,
        type: folder.type,
    };

    if (folder.type === "folder") {
        data.children = children.map((child) => mapTreeData(child));
    }

    return data;
};
