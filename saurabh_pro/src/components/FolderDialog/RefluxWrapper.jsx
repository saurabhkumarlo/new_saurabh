import React from "react";
import FolderDialog from "./FolderDialog";
import { EstimateStore, NodeSocketStore, ProjectsStore, AnnotationStore } from "../../stores";
import { withTranslation } from "react-i18next";
import { ESTIMATE_ACTION_NAME, GROUP_NAME } from "constants/NodeActionsConstants";

class RefluxWrapper extends React.Component {
    state = {
        isAdding: false,
        idUpdating: "",
        estimates: [],
        activeEstimate: {},
    };

    componentDidMount() {
        this.setState({ estimates: EstimateStore.getEstimates(), activeEstimate: EstimateStore.getActiveEstimate() });
        this.unsubscribeEstimateStore = EstimateStore.listen(this.estimateStoreUpdated);
        this.unsubscribeAnnotationStore = AnnotationStore.listen(this.annotationStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeEstimateStore();
    }

    estimateStoreUpdated = (message) => {
        switch (message) {
            case "updateEstimates":
                this.setState({ estimates: EstimateStore.getEstimates(), isAdding: false, idUpdating: "" });
                break;
            case "updateActiveEstimate":
                this.setState({ activeEstimate: EstimateStore.getActiveEstimate() });
                break;
            default:
                break;
        }
    };

    annotationStoreUpdated = (message) => {
        if (message === "EstimateInitialized") {
            this.setState({ activeEstimate: AnnotationStore.getActiveEstimate().toJS() });
        }
    };

    addEstimate = () => {
        this.setState({ isAdding: true });
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ESTIMATE, {
            action: ESTIMATE_ACTION_NAME.CREATE,
            projectId: ProjectsStore.getActiveProjectId(),
            name: this.props.t("Tender"),
        });
    };

    onDeleteEstimate = (geoProjectId, estimateId) => {
        this.setState({ idUpdating: estimateId });
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ESTIMATE, { action: ESTIMATE_ACTION_NAME.DELETE, ids: [estimateId] });
    };

    onRenameEstimate = (geoProjectId, estimateId, value) => {
        this.setState({ idUpdating: estimateId });
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ESTIMATE, { action: ESTIMATE_ACTION_NAME.UPDATE, ids: [estimateId], parameter: "name", value });
    };

    onCopyEstimate = (geoProjectId, estimateId) => {
        this.setState({ idUpdating: estimateId });
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ESTIMATE, { action: ESTIMATE_ACTION_NAME.DUPLICATE, geoProjectId, estimateId });
    };

    onLockEstimate = (geoProjectId, estimateId, value) => {
        this.setState({ idUpdating: estimateId });

        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ESTIMATE, { action: ESTIMATE_ACTION_NAME.UPDATE, ids: [estimateId], parameter: "locked", value });
    };

    render() {
        const { visible, onCancel, onAccept, top, title, withFilter, type, onDoubleClickDrive, selectedKeys } = this.props;
        const { estimates, activeEstimate, isAdding, idUpdating } = this.state;

        return (
            <FolderDialog
                visible={visible}
                onCancel={onCancel}
                onAccept={onAccept}
                top={top}
                title={title}
                withFilter={withFilter}
                type={type}
                estimates={estimates}
                activeEstimate={activeEstimate}
                isAdding={isAdding}
                idUpdating={idUpdating}
                addEstimate={this.addEstimate}
                onDeleteEstimate={this.onDeleteEstimate}
                onRenameEstimate={this.onRenameEstimate}
                onCopyEstimate={this.onCopyEstimate}
                onLockEstimate={this.onLockEstimate}
                onDoubleClickDrive={onDoubleClickDrive}
                selectedKeys={selectedKeys}
            />
        );
    }
}

export default withTranslation()(RefluxWrapper);
