import { filter, includes } from "lodash";

export const getFoldersData = () => {};

export const getTemplatesData = (templatesData, filterValue) => filter(templatesData, (o) => includes(o.title.toLowerCase(), filterValue.toLowerCase()));

export const getEstimatesData = (estimatesData, filterValue) => filter(estimatesData, (o) => includes(o.name.toLowerCase(), filterValue.toLowerCase()));

export const getTreeData = (treeData, filterValue) => filter(treeData, (o) => includes(o.name.toLowerCase(), filterValue.toLowerCase()));
