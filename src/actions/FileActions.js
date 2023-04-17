import { createActions } from "reflux";

const FileActions = createActions([
    "sendCreateRootFolder",
    "sendCreateFolder",
    "sendRemoveFolder",
    "sendUpdateFile",
    "fileInserted",
    "folderInserted",
    "filesDeleted",
    "fileUpdated",
    "requestGetFiles",
    "clearFileList",
    "setExpandedKeys",
    "setSelectedFileNodes",
    "buildTree",
    "addNodeToTree",
    "updateTree",
    "uploadFileChannelOpen",
    "uploadFile",
    "deleteFile",
    "incrementLoader",
    "deleteFolder",
]);

export default FileActions;
