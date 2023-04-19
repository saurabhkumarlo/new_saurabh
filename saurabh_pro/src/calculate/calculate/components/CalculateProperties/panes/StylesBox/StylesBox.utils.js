import _ from "lodash";
import DashedLine from "assets/icons/border-style/dashed.svg";
import SolidLine from "assets/icons/border-style/solid.svg";
import DottedLine from "assets/icons/border-style/dotted.svg";
import DotDashedLine from "assets/icons/border-style/dot-dashed.svg";
import { CircleIcon, CirclePipeIcon, GtPipeDashIcon, GtPipeIcon, LtPipeDashIcon, LtPipeIcon, NoneIcon, PipeIcon } from "assets/icons/line-arrows";
import {
    BaselineRemoveCircleOutline24px,
    BaselineRoom24px,
    BaselineStarRate24px,
    BaselineToys24px,
    IconBaselineNewReleases24px,
} from "assets/icons/point-icons";

export const borderStyleOptions = [
    {
        value: "dashed",
        iconName: DashedLine,
    },
    {
        value: "dotted",
        iconName: DottedLine,
    },
    {
        value: "dot-dash-dot",
        iconName: DotDashedLine,
    },
    {
        value: "solid",
        iconName: SolidLine,
    },
];

export const lineStyleOptions = [
    {
        value: "|<-",
        iconName: GtPipeDashIcon,
    },
    {
        value: "<",
        iconName: GtPipeIcon,
    },
    {
        value: "|",
        iconName: PipeIcon,
    },
    {
        value: "->|",
        iconName: LtPipeDashIcon,
    },
    {
        value: ">",
        iconName: LtPipeIcon,
    },
    {
        value: "o-",
        iconName: CircleIcon,
    },
    {
        value: "-",
        iconName: NoneIcon,
    },
    {
        value: "o|-",
        iconName: CirclePipeIcon,
    },
];
export const lineStyleRotatedOptions = _.map(lineStyleOptions, (o) => ({ rotated: true, ...o }));

const borderSizeValues = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];
export const borderSizes = _.map(borderSizeValues, (o) => ({ value: o }));

export const iconOptions = [
    {
        value: "none",
        name: "-",
        centered: true,
    },
    {
        value: "iconBaselineNewReleases24px",
        iconName: IconBaselineNewReleases24px,
    },
    {
        value: "baselineRemoveCircleOutline24px",
        iconName: BaselineRemoveCircleOutline24px,
    },
    {
        value: "baselineRoom24px",
        iconName: BaselineRoom24px,
    },
    {
        value: "baselineStarRate24px",
        iconName: BaselineStarRate24px,
    },
    {
        value: "baselineToys24px",
        iconName: BaselineToys24px,
    },
];
