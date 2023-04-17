export const styleToObject = (style) => {
    const data = style.replace(/;$/, "").split(";");

    return data.reduce((acc, item) => {
        const keyValue = item.split(":");

        const key = keyValue[0].trim();
        const value = keyValue[1].trim();

        return { ...acc, [key]: value };
    }, {});
};

export const objectToStyle = (styleObj) => {
    let style = "";

    for (const [key, value] of Object.entries(styleObj)) {
        style = `${style}${key}: ${value};`;
    }

    return style;
};
