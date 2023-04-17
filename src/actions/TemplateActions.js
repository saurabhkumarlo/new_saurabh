import { createActions } from "reflux";

const TemplateActions = createActions([
    "addTemplate",
    "deleteTemplate",
    "duplicateTemplate",
    "getCalculateTemplates",
    "updateTemplate",
    "addTemplateFolder",
    "deleteTemplateFolder",
    "updateTemplateFolder",
]);

export default TemplateActions;
