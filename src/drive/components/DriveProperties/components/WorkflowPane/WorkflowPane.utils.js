import React from "react";
import { Status } from "../../../../../components";

export const workflowSelectItems = () => [
    {
        value: "notStarted",
        StatusIcon: () => <Status notStarted />,
        label: "WORKFLOW.NOT_STARTED",
    },
    {
        value: "progress",
        StatusIcon: () => <Status progress />,
        label: "WORKFLOW.IN_PROGRESS",
    },
    {
        value: "review",
        StatusIcon: () => <Status review />,
        label: "WORKFLOW.REVIEW",
    },
    {
        value: "complete",
        StatusIcon: () => <Status complete />,
        label: "WORKFLOW.COMPLETE",
    },
];
