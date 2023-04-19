import React from "react";

if (process.env.REACT_APP_ENABLE_WDYR_LIB === "true") {
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
