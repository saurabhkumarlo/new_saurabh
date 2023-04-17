import React from "react";

import { Divider as AntDivider } from "antd";

const Divider = (props) => (props.vertical ? <AntDivider type="vertical" style={{ height: "100%" }} /> : <AntDivider />);

export default Divider;
