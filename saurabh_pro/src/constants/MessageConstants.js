export const actions = {
    insertArray: "insert_array",
    updateArray: "update_array",
    selectArray: "select_array",
    select: "select",
    update: "update",
    insert: "insert",
    delete: "delete",
    move: "move",
    login: "login",
    heartbeat: "heartbeat",
    openProject: "openProject",
    closeProject: "closeProject",
    requestNewPassword: "requestNewPassword",
    licenseTaken: "licenseTaken",
    importAnnotations: "importAnnotations",
};

export const groups = {
    login: "login",
    changePassword: "changePassword",
    heartbeat: "heartbeat",
    departmentUserAccess: "departmentUserAccess",
    department: "department",
    geoProject: "geoProject",
    geoFile: "geoFile",
    geoFeature: "geoFeature",
    geoAnnotation: "geoAnnotation",
    geoAnnotationRow: "geoAnnotationRow",
    geoFeatureRow: "geoFeatureRow",
    geoScale: "geoScale",
    error: "error",
    driveTemplate: "driveTemplate",
};

export const httpCodes = {
    OK: "200",
    UN_AUTHORIZED: "401",
    PAYMENT_REQUIRED: "402",
    TOO_MANY_REQUESTS: "429",
    jwtParsing: "492",
    NOT_FOUND: "404",
};

export const ProjectMessages = {
    withJWT: (group, action, payload, jwt) => {
        return {
            group: group,
            action: action,
            jwt: jwt,
            payload: payload,
        };
    },
};
