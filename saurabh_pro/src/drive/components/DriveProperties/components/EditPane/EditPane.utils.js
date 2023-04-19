export const getExtension = (selectedNode) => (selectedNode.type && selectedNode.type === "folder" ? "folder" : `.${selectedNode.title.split(".").pop()}`);

export const getFileName = (name, selectedNode) => {
    const stringArray = name.split(".");
    const isLastElExt = stringArray.at(-1) === selectedNode.type;
    const fileName = stringArray.slice(0, -1).join(".");

    return name && selectedNode.type === "folder" ? name : stringArray.length > 1 && isLastElExt ? fileName : name;
};

const filterTree = (obj, nestingLvl) => {
    let temp = 0;
    let newChildren = [];
    if (nestingLvl === 0) obj.pos = "0";
    if (obj.children) {
        obj.children.forEach((children) => {
            if (children.type === "folder") {
                children.pos = `${obj.pos}-${temp}`;
                newChildren = [...newChildren, children];
                temp++;
            }
        });
    }
    obj.children = newChildren;
    obj.children.forEach((children) => {
        if (children.type === "folder") filterTree(children, nestingLvl + 1);
    });
};

const setPathsInTree = (obj, nestingLvl) => {
    if (nestingLvl === 0) obj.path = obj.title;
    if (obj.children) {
        obj.children.map((children) => (children.path = `${obj.path} > ${children.title}`));
        if (obj.children.length > 0) obj.children.map((children) => setPathsInTree(children, nestingLvl + 1));
    }
};

export const getTreeWithPaths = ([obj]) => {
    let treeWithPaths = {};
    if (obj) {
        try {
            treeWithPaths = JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.log(error);
        }
        setPathsInTree(treeWithPaths, 0);
    }
    return [treeWithPaths];
};

export const getTreeData = ([obj]) => {
    let filteredTree = {};
    if (obj) {
        try {
            filteredTree = JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.log(error);
        }
        filterTree(filteredTree, 0);
    }
    return [filteredTree];
};

export const getFullName = (e, selectedNode) => (selectedNode.type === "folder" ? e : `${e}${getExtension(selectedNode)}`);

export const getAbbreviatedPath = (pathArr, PATH_MAX_LENGTH, PATH_SEPARATOR) =>
    [
        pathArr.length > PATH_MAX_LENGTH ? "..." : null,
        pathArr.length > PATH_MAX_LENGTH ? pathArr.map((_, i, arr) => arr.slice(-i)).filter((arr) => arr.length === PATH_MAX_LENGTH) : pathArr,
    ]
        .flat(2)
        .filter(Boolean)
        .join(PATH_SEPARATOR);
