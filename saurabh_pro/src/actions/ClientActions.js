import { createActions } from "reflux";

const ClientActions = createActions([
    "initializeClient",
    "initializeClientContacts",
    "initializeGeoProjectClientContacts",
    "initializeGeoProjectExternalUserAccess",
]);

export default ClientActions;
