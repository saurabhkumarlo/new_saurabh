import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import AuthenticationStore from "../stores/AuthenticationStore";
import { Collapse } from "antd";
import DepartmentStore from "../stores/DepartmentStore";
import FileStore from "../stores/FileStore";
import ProjectsStore from "../stores/ProjectsStore";

const getActiveUser = () => {
    const credentials = AuthenticationStore.credentials;

    const user = DepartmentStore.getDepartmentUserById(credentials.userId);

    if (!user) return {};

    return user.toJS();
};

const getCompany = () => {
    const department = DepartmentStore.departmentUserAccess.first();

    if (!department) return {};

    return department.department.company;
};

const getFile = () => {
    const selectedFileNodes = FileStore.selectedFileNodes;

    if (selectedFileNodes.length <= 0) return {};

    return selectedFileNodes[0];
};

const DataCollector = (props) => {
    const collectorRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        collectorRef.current = {
            data: getData(),
        };

        if (props.getRef) {
            props.getRef(collectorRef);
        }
    });

    const getData = () => {
        const projectFromStore = ProjectsStore.getActiveProject();

        const file = getFile();

        let activeProject = {};
        let company = getCompany();

        if (projectFromStore) {
            activeProject = projectFromStore.toJS();

            if (activeProject.department.company) {
                company = activeProject.department.company;
            }
        }

        const activeUser = getActiveUser();

        return {
            file,
            activeUser,
            activeProject,
            company,

            browser: {
                vendor: JSON.stringify(navigator.vendor),
                appVersion: JSON.stringify(navigator.appVersion),
                language: JSON.stringify(navigator.language),
                cookies: JSON.stringify(navigator.cookieEnabled),
                url: JSON.stringify(window.location.href),
            },
        };
    };

    const data = getData();

    return (
        <div style={{ marginTop: "20px" }}>
            <p>{t("The following is data is automatically detected and submitted on reporting from your system to help us better understand the issue.")}</p>
            <Collapse>
                <Collapse.Panel header={t("Collected Data")}>
                    <pre>
                        <ul>
                            <li>
                                {t("User:")} {data.activeUser.firstName} {data.activeUser.lastName}
                            </li>
                            <li>
                                {t("Username:")} {data.activeUser.email}
                            </li>
                            <li>
                                {t("Company:")} {data.company.name}
                            </li>
                            <li>
                                {t("View/URL:")} {data.browser.url}
                            </li>
                            <li>
                                {t("Project:")} {data.activeProject.name || ""}
                            </li>
                            <li>
                                {t("File:")} {data.file.title}
                            </li>
                            <li>
                                {t("Vendor:")} {data.browser.vendor}
                            </li>
                            <li>
                                {t("AppVersion:")} {data.browser.appVersion}
                            </li>
                            <li>
                                {t("Language:")} {data.browser.language}
                            </li>
                            <li>
                                {t("Cookies:")} {data.browser.cookies}
                            </li>
                        </ul>
                    </pre>
                </Collapse.Panel>
            </Collapse>
        </div>
    );
};

export default DataCollector;
