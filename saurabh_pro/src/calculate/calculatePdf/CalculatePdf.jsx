import "./calculatePdf.less";

import { AnnotationStore, IfcStore } from "../../stores";
import { Button, Tag, Tooltip } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProjectActions from "../../actions/ProjectsActions";
import React from "react";
import { withTranslation } from "react-i18next";
import classNames from "classnames";
import { getScalesFromAnnotationStore } from "utils/scaleUtilMethods";

class CalculatePdf extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isScaleAdded: false,
        };
    }
    componentDidMount() {
        AnnotationStore.initValueInheritance(this.props.projectId);
        IfcStore.initValueInheritance();
        if (!AnnotationStore.isAnnotationActionDone()) {
            ProjectActions.requestOpenProject(this.props.projectId);
            ProjectActions.requestProject(this.props.projectId);
        }
        AnnotationStore.createWebViewer(this.props.fileId, document.getElementById("webviewer"));
        this.unsubscribeAnnotationStore = AnnotationStore.listen(this.annotationStoreUpdated);
    }

    componentWillUnmount() {
        AnnotationStore.cleanup();
    }

    checkScale = () => {
        const { xScale, yScale } = getScalesFromAnnotationStore(AnnotationStore.getActivePageId());
        this.setState({
            isScaleAdded: Boolean(xScale || yScale),
        });
    };

    annotationStoreUpdated = (message) => {
        switch (message) {
            case "pageChanged":
            case "annotationsLoaded":
            case "scaleInserted":
            case "scaleDeleted":
                this.checkScale();
                break;
            default:
                break;
        }
    };

    render() {
        const { t } = this.props;
        return (
            <div className="CalculatePdf_Wrapper">
                <div className="WebViewer_Hide_Element" style={{ visibility: this.props.isResize ? "visible" : "hidden" }} />
                <div id="webviewer" className="CalculatePdf_WebViewer">
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {t("GENERAL.TOOLTIP.SCALE_1")}
                                <br />- {t("GENERAL.TOOLTIP.SCALE_2")}
                                <br />- {t("GENERAL.TOOLTIP.SCALE_3")}
                                <br />
                                <br />
                                <Tag>Ctrl + 0</Tag>
                            </span>
                        }
                    >
                        <Button
                            className={classNames(
                                "CalculatePdf_Scale",
                                this.state.isScaleAdded && "CalculatePdf_Scale--hidden",
                                !this.props.role && "CalculatePdfDisable"
                            )}
                            disabled={!this.props.role}
                            onClick={() => {
                                AnnotationStore.setToolMode("AnnotationCreateScale");
                            }}
                            icon={<FontAwesomeIcon icon={["fal", "ruler"]} />}
                        />
                    </Tooltip>
                </div>
            </div>
        );
    }
}

export default withTranslation()(CalculatePdf);
