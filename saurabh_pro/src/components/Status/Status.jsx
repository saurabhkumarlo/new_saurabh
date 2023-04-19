import React from "react";

import "./status.less";

const Status = ({ notStarted, progress, review, complete }) => {
    return (
        <div className="Status">
            {progress && <div className="Status_Part Status_Part_left-top"></div>}
            {review && <div className="Status_Part Status_Part_right-top"></div>}
            {notStarted && <div className="Status_Part Status_Part_left-bottom"></div>}
            {complete && <div className="Status_Part Status_Part_right-bottom"></div>}
            <div id="Cross" />
        </div>
    );
};

export default Status;
