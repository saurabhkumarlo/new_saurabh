import React from "react";

import { Progress, Row } from "antd";

import "./treeloader.less";

const TreeLoader = ({ loadedCount, wantedCount }) => (
    <Row justify="center" align="middle" className="TreeLoader_Container">
        <Progress percent={Math.floor((loadedCount / wantedCount) * 100)} type="circle" status="active" />
    </Row>
);

export default TreeLoader;
