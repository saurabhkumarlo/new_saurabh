import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";
import { LABEL_TYPES } from "constants/LabelsConstants";
import _ from "lodash";
import { AnnotationStore } from "stores";

export const areValuesSame = (data, obj) => {
    if (!data) return false;
    else {
        return _.every(data, (item) => {
            if ((!item || !_.get(item, obj)) && _.get(item, obj) !== 0) return false;
            return _.get(item, obj).toString() && _.get(item, obj).toString() === _.get(data[0], obj).toString();
        });
    }
};

export const getFlatActiveLabels = (data) => {
    return _.map(data, (item) => item.label);
};

export const getLabelValues = (selectedAnnotations) => {
    const labelsData = _.map(selectedAnnotations, ANNOT_ATTRIBUTES.LABELS) || [];
    const options = AnnotationStore.getLabelsOfSelectedAnnots();

    function getActiveList(options) {
        const activeList = _.filter(options, (option) => _.some(labelsData, (labelData) => _.some(labelData?.active, (activeLabel) => activeLabel === option)));
        return _.map(activeList, (activeLabel) => {
            return { label: activeLabel, inEvery: checkIfActiveLabelIsInEveryAnnots(activeLabel) };
        });
    }

    function checkIfActiveLabelIsInEveryAnnots(label) {
        const filteredAnnots = _.filter(selectedAnnotations, (annot) =>
            _.includes(_.flatten(_.values(AnnotationStore.getLabelsByAnnotType(annot.type))), label)
        );
        const labels = _.map(filteredAnnots, ANNOT_ATTRIBUTES.LABELS) || [];
        return _.every(labels, (labelData) => _.includes(labelData?.active, label));
    }

    function getCentralData() {
        const centralOptions = options.centralLabels;
        if (!centralOptions.length) return false;
        else {
            const activeList = getActiveList(centralOptions);
            if (activeList.length > 0)
                return {
                    active: activeList,
                    options: centralOptions,
                    styles: {
                        color: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.COLOR}`)
                            ? labelsData[0].centralStyles.color
                            : "",
                        bgColor: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.BG_COLOR}`)
                            ? labelsData[0].centralStyles.bgColor
                            : "",
                        font: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.FONT}`) ? labelsData[0].centralStyles.font : "",
                        fontSize: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.FONT_SIZE}`)
                            ? labelsData[0].centralStyles.fontSize
                            : "",
                        fontStyles: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.FONT_STYLES}`)
                            ? labelsData[0].centralStyles.fontStyles
                            : [],
                        opacity: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.OPACITY}`)
                            ? labelsData[0].centralStyles.opacity
                            : "",
                        bgOpacity: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.BG_OPACITY}`)
                            ? labelsData[0].centralStyles.bgOpacity
                            : "",
                        render: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${ANNOT_ATTRIBUTES.RENDER}`)
                            ? labelsData[0].centralStyles.render
                            : "",
                        x: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.x`) ? labelsData[0].centralStyles.x : "",
                        y: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.y`) ? labelsData[0].centralStyles.y : "",
                    },
                };
            else
                return {
                    active: activeList,
                    options: centralOptions,
                    styles: null,
                };
        }
    }

    function getSidesData() {
        const sideOptions = options.sideLabels;
        if (!sideOptions.length) return false;
        else {
            const activeList = getActiveList(sideOptions);
            if (activeList.length > 0)
                return {
                    active: activeList,
                    options: sideOptions,
                    styles: {
                        color: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.COLOR}`) ? labelsData[0].sideStyles.color : "",
                        bgColor: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.BG_COLOR}`)
                            ? labelsData[0].sideStyles.bgColor
                            : "",
                        font: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.FONT}`) ? labelsData[0].sideStyles.font : "",
                        fontSize: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.FONT_SIZE}`)
                            ? labelsData[0].sideStyles.fontSize
                            : "",
                        fontStyles: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.FONT_STYLES}`)
                            ? labelsData[0].sideStyles.fontStyles
                            : [],
                        opacity: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.OPACITY}`)
                            ? labelsData[0].sideStyles.opacity
                            : "",
                        bgOpacity: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.BG_OPACITY}`)
                            ? labelsData[0].sideStyles.bgOpacity
                            : "",
                        margin: areValuesSame(labelsData, `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${ANNOT_ATTRIBUTES.MARGIN}`) ? labelsData[0].sideStyles.margin : "",
                    },
                };
            else
                return {
                    active: activeList,
                    options: sideOptions,
                    styles: null,
                };
        }
    }

    return { [LABEL_TYPES.CENTRAL]: getCentralData(), [LABEL_TYPES.SIDE]: getSidesData() };
};
