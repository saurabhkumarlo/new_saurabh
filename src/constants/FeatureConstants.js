export const DESELECT_ALPHA = 0.3;
export const SELECT_ALPHA = 0.8;

export const DEFAULT_RGB = {
    r: 35,
    g: 145,
    b: 35,
    a: SELECT_ALPHA,
};
export const REDUCTION_RGB = {
    r: 128,
    g: 128,
    b: 128,
    a: DESELECT_ALPHA,
};
export const DEFAULT_HEIGHT = 2.5;

export const SingleFeatureType = {
    AREA: "area",
    LINE: "line",
    POINT: "point",
    SCALE: "scale",
    CIRCLE: "circle",
    REDUCTION: "reduction",
};

export const getTranslationStringForFeatureType = (featureType) => {
    if (!featureType) {
        return "folder";
    }
    return featureType;
};

export const DISPLAY_VALUES_OPTIONS = {
    VISIBLE: "ESTIMATE.ANNOTATION_PROPERTIES.VISIBLE",
    TURN_OFF_FILL: "ESTIMATE.ANNOTATION_PROPERTIES.FILL",
    NUMBER: "ESTIMATE.ANNOTATION_PROPERTIES.NUMBER",
    NAME: "ESTIMATE.ANNOTATION_PROPERTIES.NAME",
    AREA: "ESTIMATE.ANNOTATION_VALUES.AREA",
    NET_AREA: "ESTIMATE.ANNOTATION_VALUES.NET_AREA",
    RED_AREA: "ESTIMATE.ANNOTATION_VALUES.RED_AREA",
    LENGTHS: "ESTIMATE.ANNOTATION_VALUES.LENGTHS",
    VOLUME: "ESTIMATE.ANNOTATION_VALUES.VOLUME",
    NET_VOLUME: "ESTIMATE.ANNOTATION_VALUES.NET_VOLUME",
    RED_VOLUME: "ESTIMATE.ANNOTATION_VALUES.RED_VOLUME",
    WALLS: "ESTIMATE.ANNOTATION_VALUES.WALLS",
    TOTAL_WALL: "ESTIMATE.ANNOTATION_VALUES.WALL",
    TOTAL_NET_WALL: "ESTIMATE.ANNOTATION_VALUES.NET_WALL",
    TOTAL_RED_WALL: "ESTIMATE.ANNOTATION_VALUES.RED_WALL",
    VARIABLES: "ESTIMATE.ANNOTATION_VALUES.VARIABLES",
    REDUCTION: "ESTIMATE.DEFAULT_VALUES.REDUCTION",
    REDUCTIONS: "ESTIMATE.DEFAULT_VALUES.REDUCTIONS",
    LENGTH: "ESTIMATE.ANNOTATION_VALUES.LENGTH",
    SCALE_LENGTH: "ESTIMATE.ANNOTATION_VALUES.SCALE_LENGTH",
    NET_LENGTH: "ESTIMATE.ANNOTATION_VALUES.NET_LENGTH",
    RED_LENGTH: "ESTIMATE.ANNOTATION_VALUES.RED_LENGTH",
    SHOW_VALUES_TREE: "ESTIMATE.ANNOTATION_VALUES.TREE",
    EDGES: "ESTIMATE.ANNOTATION_VALUES.EDGES",
    SIDES: "ESTIMATE.ANNOTATION_VALUES.S",
    SIDE_LENGTHS: "ESTIMATE.ANNOTATION_VALUES.SL",
    POINTS: "ESTIMATE.ANNOTATION_VALUES.POINTS",
    COUNT: "ESTIMATE.ANNOTATION_PROPERTIES.COUNT",
    HEIGHT: "ESTIMATE.ANNOTATION_PROPERTIES.HEIGHT",
    OUTER_DIM_X: "ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X",
    OUTER_DIM_Y: "ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y",
    AREA_TILES: "ESTIMATE.ANNOTATION_VALUES.AREA_TILES",
    AREA_JOINT_LENGTH: "ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_LENGTH",
    AREA_JOINT_VOLUME: "ESTIMATE.ANNOTATION_VALUES.AREA_JOINT_VOLUME",
    WALL_TILES: "ESTIMATE.ANNOTATION_VALUES.WALL_TILES",
    WALL_JOINT_LENGTH: "ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_LENGTH",
    WALL_JOINT_VOLUME: "ESTIMATE.ANNOTATION_VALUES.WALL_JOINT_VOLUME",
    RADIUS_X: "ESTIMATE.ANNOTATION_VALUES.RADIUS_X",
    RADIUS_Y: "ESTIMATE.ANNOTATION_VALUES.RADIUS_Y",
    DIAMETER_X: "ESTIMATE.ANNOTATION_VALUES.DIAMETER_X",
    DIAMETER_Y: "ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y",
};

// const getZoomedWidth = (width) => {
//     if (MapStore.getZoom() === 3) {
//         width = width * (MapStore.getZoom() - 1); //* 2
//     } else if (MapStore.getZoom() === 4) {
//         width = width * (MapStore.getZoom()); //*4
//     } else if (MapStore.getZoom() === 5) {
//         width = width * (MapStore.getZoom() + 3); //* 8
//     } else if (MapStore.getZoom() === 6) {
//         width = width * (MapStore.getZoom() + 10); //* 16
//     } else if (MapStore.getZoom() === 7) {
//         width = width * (MapStore.getZoom() + 25); //* 32
//     } else if (MapStore.getZoom() === 8) {
//         width = width * (MapStore.getZoom() + 56); //*64
//     }
//     return width;
// };

export const featureTypes = {
    DRAWING: "drawing",
    SCALE: "scale",
    GROUP: "group",
};

// export const styles = {
//     color: (color) => {
//         return new ol.style.Style({
//             fill: new ol.style.Fill({color: color}),
//             stroke: new ol.style.Stroke({
//                 color: color,
//                 width: 2
//             }),
//             image: new ol.style.Circle({
//                 radius: 3,
//                 fill: new ol.style.Fill({color: color})
//             })
//         });
//     },
//     drawing: () => {
//         return new ol.style.Style({
//             fill: new ol.style.Fill({
//                 color: 'rgba(255, 255, 255, 0.2)'
//             }),
//             stroke: new ol.style.Stroke({
//                 color: 'rgba(0, 0, 0, 0.5)',
//                 lineDash: [10, 10],
//                 width: 2
//             }),
//             image: new ol.style.Icon({
//                 src: 'images/cursor_30x30.svg',
//                 anchor: [0.5, 0.5],
//                 offset: [0, 0],
//                 rotateWithView: false,
//                 rotation: 0
//             })
//         });
//     },
//     scale: () => {
//         return new ol.style.Style({
//             fill: new ol.style.Fill({
//                 color: 'rgba(207, 42, 39, 0.2)'
//             }),
//             stroke: new ol.style.Stroke({
//                 lineCap: 'butt',
//                 color: 'rgba(207, 42, 39, 0.7)',
//                 //lineDash: [1, 1],
//                 width: 2
//             }),
//             image: new ol.style.Icon({
//                 src: 'images/cursor_30x30.svg',
//                 anchor: [0.5, 0.5],
//                 offset: [0, 0],
//                 rotateWithView: false,
//                 rotation: 0
//             })
//         });
//     },
//     line: (feature, color, width) => {
//         const realWidth = getZoomedWidth(width);
//         let styles = [];
//         styles.push(new ol.style.Style({
//             fill: new ol.style.Fill({
//                 color: color
//             }),
//             stroke: new ol.style.Stroke({
//                 lineCap: 'butt',
//                 color: color,
//                 width: realWidth
//             })

//         }));
//         styles = styles.concat(getLineVerticalEndStyle(feature, color, width));
//         return styles;
//     },
//     point: (color, width) => {
//         width = getZoomedWidth(width);
//         return new ol.style.Style({
//             image: new ol.style.Circle({
//                 radius: width,
//                 fill: new ol.style.Fill({
//                     color: color
//                 }),
//             })
//         });

//     }
// };
