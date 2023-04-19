export const SOCKET_EVENT_TYPE = {
    CONNECT: "connect",
    RECONNECT: "reconnect",
    RECONNECT_ERR: "reconnect_error",
    DISCONNECT: "disconnect",
    ERROR: "error",
    BUNDLE_REFRESH: "bundleRefresh",
};

export const GROUP_NAME = {
    GEO_ANNOTATION: "geoAnnotation",
    GEO_FILE: "geoFile",
    GEO_PROJECT: "geoProject",
    GEO_ANNOTATION_ROW: "geoAnnotationRow",
    GEO_ESTIMATE: "geoEstimate",
    GEO_SCALE: "geoScale",
    GEO_ROW_LIBRARY: "geoRowLibrary",
    AUTH: "auth",
};

export const ANNOTATION_ACTION_NAME = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    DUPLICATE: "duplicate",
};

export const SCALE_ACTION_NAME = {
    CREATE: "create",
    DELETE: "delete",
    UPDATE: "update",
};

export const ANNOTATION_ROW_ACTION_NAME = {
    CREATE: "create",
    DELETE: "delete",
    UPDATE: "update",
};

export const PROJECT_ACTION_NAME = {
    OPEN: "open",
    LEAVE: "leave",
    CREATE: "create",
    DELETE: "delete",
    UPDATE: "update",
};

export const ESTIMATE_ACTION_NAME = {
    CREATE: "create",
    DELETE: "delete",
    UPDATE: "update",
    DUPLICATE: "duplicate",
};

export const ROW_LIBRARY_ACTION_NAME = {
    CREATE: "create",
    DELETE: "delete",
    UPDATE: "update",
};

export const AUTH_ACTION_NAME = {
    LICENSE_ACTIVATED_FROM_ELSEWHERE: "licenseActivatedFromElsewhere",
    SESSION_EXPIRED: "sessionExpired",
    ACCEPT_TERMS_OF_SERVICE: "acceptTermsOfService",
};

export const FILE_ACTION_NAME = {
    CREATE_GROUP: "createGroup",
    UPDATE: "update",
};
