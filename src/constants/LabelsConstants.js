export const LABELS = {
    NR_TAG: "ESTIMATE.NR_TAG",
    NAME: "GENERAL.NAME",
    VARIABLES: "ESTIMATE.VARIABLES",

    AREA: "ESTIMATE.AREA",
    LENGTH: "ESTIMATE.LENGTH",
    VOLUME: "ESTIMATE.VOLUME",
    WALL: "ESTIMATE.WALL",

    NET_AREA: "ESTIMATE.NET_AREA",
    NET_LENGTH: "ESTIMATE.NET_LENGTH",
    NET_VOLUME: "ESTIMATE.NET_VOLUME",
    NET_WALL: "ESTIMATE.NET_WALL",

    LENGTHS: "ESTIMATE.LENGTHS",
    WALLS: "ESTIMATE.WALLS",

    RADIUS_X: "ESTIMATE.RADIUS_X",
    RADIUS_Y: "ESTIMATE.RADIUS_Y",
    DIAMETER_X: "ESTIMATE.DIAMETER_X",
    DIAMETER_Y: "ESTIMATE.DIAMETER_Y",

    OUTER_DIM_X: "ESTIMATE.OUTER_DIM_X",
    OUTER_DIM_Y: "ESTIMATE.OUTER_DIM_Y",

    RED_AREA: "ESTIMATE.REDUCTION_AREA",
    RED_LENGTH: "ESTIMATE.REDUCTION_LENGTH",
    RED_VOLUME: "ESTIMATE.REDUCTION_VOLUME",
    RED_WALL: "ESTIMATE.REDUCTION_WALL",
};

export const RENDER_TYPES = {
    GROUPED: { value: "grouped-rows", label: "ESTIMATE.LABELS.GROUPED_ROWS" },
    ROWS: { value: "rows", label: "ESTIMATE.LABELS.ROWS" },
    INLINE: { value: "inline", label: "ESTIMATE.LABELS.INLINE" },
    ABOVE: { value: "above", label: "ESTIMATE.LABELS.ABOVE" },
    BELOW: { value: "below", label: "ESTIMATE.LABELS.BELOW" },
    RIGHT_GROUPED: { value: "right-grouped", label: "ESTIMATE.LABELS.RIGHT_GROUPED" },
    RIGHT_ROWS: { value: "right-rows", label: "ESTIMATE.LABELS.RIGHT_ROWS" },
    BELOW_GROUPED: { value: "below-grouped", label: "ESTIMATE.LABELS.BELOW_GROUPED" },
    BELOW_ROWS: { value: "below-rows", label: "ESTIMATE.LABELS.BELOW_ROWS" },
};

export const LABEL_TYPES = {
    CENTRAL: "central",
    SIDE: "side",
};

export const RENDERS_PER_LABEL_TYPES = {
    CENTRAL: [RENDER_TYPES.GROUPED, RENDER_TYPES.ROWS, RENDER_TYPES.INLINE],
    POINT: [RENDER_TYPES.RIGHT_GROUPED, RENDER_TYPES.RIGHT_ROWS, RENDER_TYPES.BELOW_GROUPED, RENDER_TYPES.BELOW_ROWS],
};

export const sideLabelsTypes = [
    {
        key: "follow",
        label: "ESTIMATE.FOLLOW",
    },
    {
        key: "static",
        label: "ESTIMATE.STATIC",
    },
];

export const markerTypes = [
    {
        key: "small",
        label: "GENERAL.SMALL",
        size: 5,
    },
    {
        key: "medium",
        label: "GENERAL.MEDIUM",
        size: 10,
    },
    {
        key: "large",
        label: "GENERAL.LARGE",
        size: 15,
    },
];
