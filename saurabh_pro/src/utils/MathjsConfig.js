/**
 * Created by PatrikGlendell on 27/06/2017.
 */

import { all, create } from "mathjs";

const config = {
    epsilon: 1e-12,
    matrix: "Matrix",
    number: "number",
    precision: 64,
    predictable: false,
    randomSeed: null,
};
const math = create(all, config);

export default function initMath() {
    const replacements = {};

    // our extended configuration options
    const config = {
        angles: "deg", // 'rad', 'deg', 'grad'
    };

    // create trigonometric functions replacing the input depending on angle config
    ["sin", "cos", "tan", "sec", "cot", "csc", "asin", "acos", "atan", "atan2", "acot", "acsc", "asec"].forEach(function (name) {
        const fn = math[name]; // the original function

        const fnNumber = function (x) {
            // convert from configured type of angles to radians
            const result = fn(x);
            switch (config.angles) {
                case "deg":
                    if (["asin", "acos", "atan", "atan2", "acot", "acsc", "asec"].includes(name)) {
                        return (result / 2 / Math.PI) * 360;
                    }
                    return fn((x / 360) * 2 * Math.PI);
                case "grad":
                    if (["asin", "acos", "atan", "atan2", "acot", "acsc", "asec"].includes(name)) {
                        return (result / 2 / Math.PI) * 400;
                    }
                    return fn((x / 400) * 2 * Math.PI);
                default:
                    return result;
            }
        };

        // create a typed-function which check the input types
        replacements[name] = math.typed(name, {
            number: fnNumber,
            "Array | Matrix": function (x) {
                return math.map(x, fnNumber);
            },
        });
    });
    return replacements;
}
