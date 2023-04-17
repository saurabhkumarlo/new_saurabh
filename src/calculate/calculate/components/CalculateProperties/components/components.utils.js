import React from "react";
import { TreeStoreV2 } from "stores";
import { List } from "antd";
import { Status } from "components";

const getBackgroundColor = (item) => {
    switch (item.type) {
        case "Polyline":
        case "Arrow":
            return item.color;
        default:
            return item.interiorColor;
    }
};

export const renderListItem = (item) => {
    const backgroundColor = getBackgroundColor(item);
    return (
        <List.Item className="List_Item">
            {item.type === "x-scale" || item.type === "y-scale" ? (
                <>
                    <div className="List_Item_Icon_Wrapper">{TreeStoreV2.getFileIcon(item.type)}</div>
                    {item.type !== "group" && item.type !== "3DModel" && <div className="List_Item_Square" style={{ backgroundColor }} />}
                    {item.type !== "group" && <label>{item.number}</label>}
                    <label>{item.type}</label>
                </>
            ) : (
                <>
                    <div className="List_Item_Icon_Wrapper">{TreeStoreV2.getFileIcon(item.type)}</div>
                    {item.type !== "group" && item.status && (
                        <div className="List_Item_Status_Icon">
                            <Status
                                notStarted={item.status === "notStarted" || item.xfdf.status === "notStarted" || (!item.status && !item.xfdf.status)}
                                progress={item.status === "progress" || item.xfdf.status === "progress"}
                                review={item.status === "review" || item.xfdf.status === "review"}
                                complete={item.status === "complete" || item.xfdf.status === "complete"}
                            />
                        </div>
                    )}
                    {item.type !== "group" && item.type !== "3DModel" && <div className="List_Item_Square" style={{ backgroundColor }} />}
                    {item.type !== "group" && <label>{item.number}</label>}
                    <label>{item.name}</label>
                </>
            )}
        </List.Item>
    );
};
