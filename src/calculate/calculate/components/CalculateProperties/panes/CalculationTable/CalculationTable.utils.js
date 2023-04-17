import i18n from "i18nextInitialized";

export const getRow = (key, variable, part, value, unit) => {
    const theValue = value.toLocaleString({ minimumFractionDigits: 3 });
    return {
        key,
        variable,
        part,
        value: theValue,
        unit: unit,
    };
};

export const propertiesColumns = (formatValueColumn) => [
    {
        title: "",
        dataIndex: "variable",
        key: "variable",
        size: 1,
    },
    {
        title: "Part",
        dataIndex: "part",
        key: "part",
    },
    {
        title: "Value",
        dataIndex: "value",
        key: "value",
        align: "right",
        render: formatValueColumn,
    },
];

export const parseString = (valueString) => {
    const lng = i18n.language;
    if (lng !== "en-GB" && lng !== "en-US")
        return valueString.replace(new RegExp("\\,", "g"), function (match) {
            return match == "," ? "." : ",";
        });
    else return valueString;
};
