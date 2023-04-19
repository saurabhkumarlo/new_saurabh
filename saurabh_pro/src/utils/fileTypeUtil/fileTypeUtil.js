import types from "./types";

Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter((key) => predicate(obj[key]))
        .reduce((res, key) => ((res[key] = obj[key]), res), {});

const translateMimeType = (type) => {
    const foundTypes = Object.filter(types, (item) => item.types.includes(type));

    let foundType = foundTypes[Object.keys(foundTypes)[0]];

    if (foundType) {
        return foundType;
    }

    return {
        types: [type],
        humanName: `${type} File`,
        icon: "file-unknown",
    };
};

const translateFileExtension = (fileName) => {
    const extension = fileName.split(".").pop();

    const foundTypes = Object.filter(types, (item) => item.fileExtensions.includes(extension));
    const foundIcon = types[extension];

    let foundType = foundTypes[Object.keys(foundTypes)[0]];

    if (foundType) {
        return foundType;
    }

    return {
        fileExtensions: [extension],
        humanName: `${extension} File`,
        icon: foundIcon,
    };
};

const filterImages = (files) => {
    let workingFiles = files.slice();
    return workingFiles
        .map((file) => {
            if (file.type === "folder") {
                return {
                    ...file,
                    children: filterImages(file.children),
                };
            }

            if (translateMimeType(file.type).image) {
                return file;
            } else {
                return null;
            }
        })
        .filter((item) => item !== null);
};

export { translateMimeType, filterImages, translateFileExtension };
