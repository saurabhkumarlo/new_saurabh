import { sortBy, filter } from "lodash";
import array from "lodash";

export const getSortedTreeData = (tree) => {
    if (tree.length == 0) return tree;
    const clonedTree = array.cloneDeep(tree);
    sortTree(clonedTree[0]);
    return clonedTree;
};

const sortTree = (node) => {
    let newChildren = [];
    if (node.children.length > 0) {
        const folders = filter(node.children, (children) => children.type === "folder");
        const otherFiles = filter(node.children, (children) => children.type !== "folder");
        newChildren = [...sortBy(folders, (o) => o.title), ...sortBy(otherFiles, (o) => o.title)];
    }
    node.children = newChildren;
    node.children.forEach((children) => {
        if (children.type === "folder") sortTree(children);
    });
};
