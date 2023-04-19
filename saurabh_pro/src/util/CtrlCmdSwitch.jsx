import React from "react";

class CtrlCmdSwitch extends React.PureComponent {
    render() {
        return <span>{navigator.platform === "darwin" ? "⌘" : "CTRL"}</span>;
    }
}

export default CtrlCmdSwitch;
