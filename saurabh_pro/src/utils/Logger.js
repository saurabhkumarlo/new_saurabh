// Utility class for switching debug mode on and of, use this logger class
// instead of //console.log. This is only a wrapper for //console.log

// TODO: future improvement, have gulp change below variables depending on which
// environment that are being built.
const debug = true;
const info = true;
const error = true;

export default {
    d(msg, object) {
        if (debug) {
            if (object !== undefined) {
            } else {
            }
        }
    },

    e(msg, object) {
        if (debug || error) {
            if (object !== undefined) {
            } else {
            }
        }
    },

    f(msg, object) {
        if (object !== undefined) {
        } else {
        }
    },

    i(msg, object) {
        if (debug || info) {
            if (object !== undefined) {
            } else {
            }
        }
    },
};
