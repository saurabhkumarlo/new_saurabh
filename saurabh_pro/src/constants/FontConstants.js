import _ from "lodash";

const fonts = [
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Times",
    "Courier New",
    "Verdana",
    "Courier",
    "Arial Narrow",
    "Candara",
    "Geneva",
    "Calibri",
    "Optima",
    "Cambria",
    "Garamond",
    "Perpetua",
    "Monaco",
    "Didot",
    "Brush Script MT",
    "Lucida Bright",
    "Copperplate",
];

export const FONTS_LIST = _.sortBy(
    _.map(fonts, (font) => ({ value: font, label: font })),
    ["label"]
);

export const FONT_STYLES = [
    {
        value: "bold",
        label: "Bold",
    },
    {
        value: "italic",
        label: "Italic",
    },
    {
        value: "small-caps",
        label: "Small-Caps",
    },
];

export const DECORATION_LIST = [
    {
        value: "bold",
        label: "Bold",
    },
    {
        value: "underline",
        label: "Underline",
    },
    {
        value: "italic",
        label: "Italic",
    },
    {
        value: "line-through",
        label: "Line-Through",
    },
];
