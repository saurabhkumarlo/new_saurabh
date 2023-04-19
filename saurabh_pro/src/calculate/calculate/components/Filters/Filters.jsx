import { ClosablePopover, PopoverContent } from "calculate/calculate-tree/components";
import { Status } from "components";
import React from "react";
import { TreeStoreV2 } from "stores";

const Filters = ({ checkedFilters, treeData }) => {
    const clearFilters = () => {
        TreeStoreV2.setCheckedFilters(["notStarted", "progress", "review", "complete"]);
        TreeStoreV2.setPopoverVisible(false);
    };

    const togglePopover = (visibility) => {
        if (visibility) {
            TreeStoreV2.setPopoverVisible(true);
        } else {
            clearFilters();
        }
    };

    const toggleFilters = (filter) => {
        const updatedCheckedItems = checkedFilters.includes(filter) ? checkedFilters.filter((item) => item !== filter) : [...checkedFilters, filter];
        TreeStoreV2.setCheckedFilters(updatedCheckedItems);
    };

    return (
        <>
            {treeData.length > 0 ? (
                <ClosablePopover
                    content={<PopoverContent annotation={null} checkedFilters={checkedFilters} toggleCurrentFilters={toggleFilters} />}
                    trigger="click"
                    placement="right"
                    onVisibleChange={togglePopover}
                    isActiveAnnotation={true}
                    mainStatusFilter={true}
                    clearFilters={clearFilters}
                >
                    <div className="Tree_Title_Statuses filterAllTreeStatus">
                        <Status notStarted progress review complete />
                    </div>
                </ClosablePopover>
            ) : (
                <div className="Tree_Title_Statuses filterAllTreeStatus" />
            )}
        </>
    );
};

export default Filters;
