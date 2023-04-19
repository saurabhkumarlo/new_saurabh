import { get } from "lodash";
import { X_SCALE_NAME, Y_SCALE_NAME, SCALE_X_LENGTH, SCALE_Y_LENGTH } from "../../constants/ScaleConstants";
import ScaleStore from "../../stores/ScaleStore";

export const getScaleColorValue = (scaleType, page) => get(ScaleStore.getScale(scaleType, page), "color");

export const getScaleInputWidth = (length) => (length ? (length.toString().length + 2) * 6 + 12 : 20);

export const lengthValues = {
    [X_SCALE_NAME]: SCALE_X_LENGTH,
    [Y_SCALE_NAME]: SCALE_Y_LENGTH,
};
