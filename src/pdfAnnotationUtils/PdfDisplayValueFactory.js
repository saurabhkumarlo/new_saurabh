import { DISPLAY_VALUES_OPTIONS } from "./../constants/FeatureConstants";

class PdfDisplayValueFactory {
    static getInstance() {
        if (!PdfDisplayValueFactory.instance) {
            PdfDisplayValueFactory.instance = new PdfDisplayValueFactory();
        }
        return PdfDisplayValueFactory.instance;
    }

    getValueStateBygType(type) {
        let displayValues;
        switch (type) {
            case "annotation.freeHand":
            case "Free Hand":
            case "Free hand":
                displayValues = [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.TOTAL_WALL,
                    DISPLAY_VALUES_OPTIONS.TOTAL_NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                    DISPLAY_VALUES_OPTIONS.TURN_OFF_FILL,
                ];
                break;
            case "Polygon":
                displayValues = [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.LENGTHS,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.WALLS,
                    DISPLAY_VALUES_OPTIONS.TOTAL_WALL,
                    DISPLAY_VALUES_OPTIONS.TOTAL_NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                    DISPLAY_VALUES_OPTIONS.REDUCTION,
                    DISPLAY_VALUES_OPTIONS.TURN_OFF_FILL,
                ];
                break;
            case "Reduction":
                displayValues = [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.LENGTHS,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.WALLS,
                    DISPLAY_VALUES_OPTIONS.TOTAL_WALL,
                    DISPLAY_VALUES_OPTIONS.TOTAL_NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                    DISPLAY_VALUES_OPTIONS.TURN_OFF_FILL,
                ];
                break;
            case "Ellipse":
                displayValues = [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.WALL,
                    DISPLAY_VALUES_OPTIONS.NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                    DISPLAY_VALUES_OPTIONS.TURN_OFF_FILL,
                ];
                break;
            case "Polyline":
                displayValues = [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.LENGTHS,
                    DISPLAY_VALUES_OPTIONS.WALLS,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                ];
                break;
            case "Stamp":
            case "Arrow":
                displayValues = [];
                break;
            case "Point":
                displayValues = [DISPLAY_VALUES_OPTIONS.VISIBLE, DISPLAY_VALUES_OPTIONS.NUMBER, DISPLAY_VALUES_OPTIONS.NAME];
                break;
            case "Free text":
                displayValues = [DISPLAY_VALUES_OPTIONS.VISIBLE];
                break;
            case "x-scale":
            case "y-scale":
                displayValues = [DISPLAY_VALUES_OPTIONS.SCALE_LENGTH];
                break;
            default:
                displayValues = [];
        }
        return displayValues;
    }

    getDisplayValuesByTypeAndPlacement(gType) {
        const valueTypes = {};
        valueTypes.centerValues = this.getCenterValuesBygType(gType);
        valueTypes.peripheralValues = this.getPeripheralValuesBygType(gType);
        return valueTypes;
    }

    getCenterValuesBygType(type) {
        switch (type) {
            case "Polygon":
            case "Reduction":
                return [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.TOTAL_WALL,
                    DISPLAY_VALUES_OPTIONS.TOTAL_NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                    DISPLAY_VALUES_OPTIONS.REDUCTION,
                ];
            case "Point":
                return [DISPLAY_VALUES_OPTIONS.NUMBER, DISPLAY_VALUES_OPTIONS.NAME];
            case "annotation.freeHand":
            case "Free Hand":
            case "Free hand":
                return [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.TOTAL_WALL,
                    DISPLAY_VALUES_OPTIONS.TOTAL_NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                ];
            case "Ellipse":
                return [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.AREA,
                    DISPLAY_VALUES_OPTIONS.NET_AREA,
                    DISPLAY_VALUES_OPTIONS.LENGTH,
                    DISPLAY_VALUES_OPTIONS.NET_LENGTH,
                    DISPLAY_VALUES_OPTIONS.VOLUME,
                    DISPLAY_VALUES_OPTIONS.NET_VOLUME,
                    DISPLAY_VALUES_OPTIONS.WALL,
                    DISPLAY_VALUES_OPTIONS.NET_WALL,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                ];
            case "Polyline":
                return [];
            case "Free text":
            case "Stamp":
            case "Arrow":
                return [];
            case "x-scale":
            case "y-scale":
                return [DISPLAY_VALUES_OPTIONS.SCALE_LENGTH];
            default:
                return [];
        }
    }

    getPeripheralValuesBygType(type) {
        switch (type) {
            case "Polygon":
            case "Reduction":
                return [DISPLAY_VALUES_OPTIONS.VISIBLE, DISPLAY_VALUES_OPTIONS.LENGTHS, DISPLAY_VALUES_OPTIONS.WALLS, DISPLAY_VALUES_OPTIONS.VARIABLES];
            case "Point":
                return [];
            case "annotation.freeHand":
            case "Free Hand":
            case "Free hand":
                return [];
            case "Ellipse":
                return [];
            case "Polyline":
                return [
                    DISPLAY_VALUES_OPTIONS.VISIBLE,
                    DISPLAY_VALUES_OPTIONS.NUMBER,
                    DISPLAY_VALUES_OPTIONS.NAME,
                    DISPLAY_VALUES_OPTIONS.LENGTHS,
                    DISPLAY_VALUES_OPTIONS.WALLS,
                    DISPLAY_VALUES_OPTIONS.VARIABLES,
                ];
            case "Free text":
                return [DISPLAY_VALUES_OPTIONS.VISIBLE];
            case "Stamp":
            case "Arrow":
                return [];
            case "x-scale":
            case "y-scale":
                return [];
            default:
                return [];
        }
    }
}

export default PdfDisplayValueFactory;
