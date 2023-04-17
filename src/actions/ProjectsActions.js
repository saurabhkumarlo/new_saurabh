import { createActions } from "reflux";

const ProjectsActions = createActions([
    "requestProjects",
    "requestProject",
    "requestOpenProject",
    "requestCloseProject",
    "requestInsertNewProject",
    "requestDeleteProject",
    "messageReceived",
    "requestUpdateProject",
]);

export default ProjectsActions;
