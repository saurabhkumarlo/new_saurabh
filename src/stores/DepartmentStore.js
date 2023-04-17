import AuthenticationStore from "../stores/AuthenticationStore";
import DepartmentActions from "../actions/DepartmentActions";
import Immutable from "immutable";
import _ from "lodash";
import { createStore } from "reflux";
import axios from "axios";

export default createStore({
    listenables: [DepartmentActions],

    init() {
        this.fileDepartmentUserAccess = new Immutable.Map();
        this.departmentUserAccess = new Immutable.List();
        this.departmentUserList = new Immutable.List();
    },

    getAccessibleDeparments() {
        return this.departmentUserAccess;
    },
    getDepartmentUserById(id) {
        return this.departmentUserList.find((value) => {
            return value.get("id") === id;
        });
    },
    getSelectedDepartmentId() {
        return this.selectedDepartmentId;
    },
    setSelectedDepartmentId(seletectedDepartmentId) {
        this.selectedDepartmentId = seletectedDepartmentId;
        this.trigger("departmentSelectionUpdated");
    },

    async onRequestDepartmentUserAccess() {
        await axios
            .get(`${process.env.REACT_APP_NODE_URL}/departments`, {
                headers: {
                    Authorization: AuthenticationStore.getJwt(),
                },
            })
            .then((response) => {
                this.departmentUserAccess = Immutable.List.of(response.data).flatMap((value) => {
                    return value;
                });
                this.selectedDepartmentId = (this.departmentUserAccess.first() || { department: {} }).department.id;
                this.departmentUserList = Immutable.fromJS(
                    _.uniqBy(
                        this.departmentUserAccess
                            .flatMap((value) => {
                                return _.clone(value.departmentUsers);
                            })
                            .toArray(),
                        "id"
                    )
                );
                this.trigger("departmentUserAccessRecieved");

                if (window.Tawk_API && window.Tawk_API.onLoaded) {
                    const user = this.departmentUserList.find((item) => item.get("id") === AuthenticationStore.credentials.userId);

                    window.Tawk_API.setAttributes({
                        email: AuthenticationStore.credentials.username,
                        name: `${user.get("firstName")} ${user.get("lastName")}`,
                    });
                }
            });
    },

    onInitializeDepartmentUserAccess(departmentUsers) {
        this.fileDepartmentUserAccess = new Immutable.Map(departmentUsers);
    },
});
