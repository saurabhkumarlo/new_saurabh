/**
 * Created by PatrikGlendell on 2017-01-10.
 */

import { all, create } from "mathjs";

import i18n from "../i18nextInitialized.js";

//import mathjs from 'mathjs';

const config = {
    epsilon: 1e-12,
    matrix: "Matrix",
    number: "number",
    precision: 64,
    predictable: false,
    randomSeed: null,
};
const math = create(all, config);

//math.config({
//  number: 'BigNumber', // Default type of number:// 'number' (default), 'BigNumber', or 'Fraction'
// precision: 64        // Number of significant digits for BigNumbers
//});
export function toUS(value, fromUnit) {
    const frack = math.fraction(0, 1);
    if (value) {
        const ans = math.splitUnit(math.unit(value, fromUnit), ["ft", "in"]);
        let rem = ans[1].toNumeric() % 1;
        ans[1] = math.unit(math.floor(ans[1].toNumeric()), "in");

        if (math.smaller(rem, 1 / 64)) {
            rem = 0;
        } else if (math.larger(rem, 63 / 64)) {
            rem = 0;
            ans[1] = math.unit(math.floor(ans[1].toNumeric()) + 1, "in");
        }
        if (!math.equal(rem, 0)) {
            ans[2] = math.fraction(math.floor(rem / (1 / 64)) / 64);
        }

        return ans
            .filter((x, i) => {
                if (i === 2) {
                    return math.round(math.number(x), 4) !== 0 && math.unequal(x, frack);
                } else {
                    return math.floor(math.round(x.toNumeric(), 4)) !== 0 && math.floor(math.round(x.toNumeric(), 4)) > 0;
                }
            })
            .reduce((x, tail) => {
                if (math.typeof(tail) === "Unit") {
                    return x + tail.toNumeric().toLocaleString() + " " + tail.units[0].unit.name + " ";
                } else {
                    return x + math.format(tail, { fraction: "ratio", precision: 4, notation: "fixed" }) + " ";
                }
            }, "")
            .trim()
            .replace(/ in/gi, '"')
            .replace(/ ft/gi, "'");
    } else {
        return "";
    }
}

export function toUSsquared(value, fromUnit) {
    const convertedValue = math.unit(value, fromUnit).to("sqft");
    return convertedValue.toNumeric().toLocaleString(i18n.language) + " ft²";
}

export function toUSvolume(value, fromUnit) {
    const convertedValue = math.unit(value, fromUnit).to("cuft");
    return convertedValue.toNumeric().toLocaleString(i18n.language) + " ft³";
}

export function toMetric(value) {
    let metric = 0;
    let ans = value.trim().replace(/ /gi, "");

    ans = ans.replace(/"/gi, "in ").replace(/'/gi, "ft ").trim().toLocaleLowerCase().split(" ");

    for (let i = 0; i < ans.length; i++) {
        if (ans[i].includes("yd")) {
            ans[i] = ans[i].slice(0, ans[i].indexOf("yd"));
            metric = math.add(math.bignumber(metric), math.bignumber(math.unit(ans[i], "yd").to("m").toNumeric()));
        } else if (ans[i].includes("ft")) {
            ans[i] = ans[i].slice(0, ans[i].indexOf("ft"));
            metric = math.add(math.bignumber(metric), math.bignumber(math.unit(ans[i], "ft").to("m").toNumeric()));
        } else if (ans[i].includes("in")) {
            ans[i] = ans[i].slice(0, ans[i].indexOf("in"));
            metric = math.add(math.bignumber(metric), math.bignumber(math.unit(ans[i], "in").to("m").toNumeric()));
        } else {
            metric = math.add(
                math.bignumber(metric),
                math
                    .unit(math.bignumber(math.eval(ans[i])), "in")
                    .to("m")
                    .toNumeric()
            );
        }
    }
    return metric.toPrecision(10);
}
