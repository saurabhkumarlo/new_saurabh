import "./wdyr.js";
import "./index.less";
import * as serviceWorker from "./serviceWorker";

import App from "./App";
import React from "react";
import ReactDOM from "react-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fal } from "@fortawesome/pro-light-svg-icons";

library.add(fal);

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);

serviceWorker.unregister();

window.process = process;
window.process.env = process.env;
