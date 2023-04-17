import { Button, Checkbox, Empty, Menu, Radio } from "antd";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import classNames from "classnames";
import { useTranslation } from "react-i18next";

// This file is based on https://github.com/ant-design/ant-design/tree/13a829d20c8a1a83c3bfa1f9d7c30d95659f5b57/components/table/hooks/useFilter

const { SubMenu, Item: MenuItem } = Menu;

const hasSubMenu = (filters) => filters.some(({ children }) => children);

const renderFilterItems = ({ filters, filteredKeys, filterMultiple }) => {
    if (filters.length === 0) {
        // wrapped with <div /> to avoid react warning
        // https://github.com/ant-design/ant-design/issues/25979
        return (
            <div
                style={{
                    margin: "16px 0",
                }}
            >
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={"No filters"}
                    imageStyle={{
                        height: 24,
                    }}
                />
            </div>
        );
    }
    return filters.map((filter, index) => {
        const key = String(filter.value);
        const { t } = useTranslation();
        if (filter.children) {
            return (
                <SubMenu key={key || index} title={filter.text} popupClassName={`ant-table-filter-dropdown-submenu`}>
                    {renderFilterItems({
                        filters: filter.children,
                        prefixCls: "ant-table-filter",
                        filteredKeys,
                        filterMultiple,
                    })}
                </SubMenu>
            );
        }

        const Component = filterMultiple ? Checkbox : Radio;

        return (
            <MenuItem key={filter.value !== undefined ? key : index}>
                <Component checked={filteredKeys.includes(key)} />
                <span>{t(filter.text)}</span>
            </MenuItem>
        );
    });
};

const FilterOverlay = forwardRef(({ filterMultiple, filters, triggerFilter }, ref) => {
    const openRef = useRef();

    const [filteredKeys, setFilteredKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);

    useEffect(
        () => () => {
            window.clearTimeout(openRef.current);
        },
        []
    );

    useEffect(() => {
        onSelectKeys({ selectedKeys: filteredKeys || [] });
    }, [onSelectKeys, filteredKeys]);

    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
        reset: () => {
            setFilteredKeys([]);
        },
    }));

    const onSelectKeys = useCallback(({ selectedKeys }) => {
        setFilteredKeys(selectedKeys);
    });

    const onOpenChange = (keys) => {
        openRef.current = window.setTimeout(() => {
            setOpenKeys(keys);
        });
    };
    const onMenuClick = () => {
        window.clearTimeout(openRef.current);
    };

    const internalTriggerFilter = (keys) => {
        triggerFilter(keys);
    };

    const onConfirm = () => {
        internalTriggerFilter(filteredKeys);
    };

    const onReset = () => {
        setFilteredKeys([]);
        internalTriggerFilter([]);
    };

    const selectedKeys = filteredKeys || [];
    let dropdownContent = (
        <>
            <Menu
                multiple={filterMultiple}
                prefixCls={`ant-dropdown-menu`}
                className={classNames({ [`ant-dropdown-menu-without-submenu`]: !hasSubMenu(filters || []) })}
                onClick={onMenuClick}
                onSelect={onSelectKeys}
                onDeselect={onSelectKeys}
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={onOpenChange}
            >
                {renderFilterItems({
                    filters: filters || [],
                    filteredKeys: filteredKeys,
                    filterMultiple,
                })}
            </Menu>
            <div className={`ant-table-filter-dropdown-btns`}>
                <Button type="link" size="small" disabled={selectedKeys.length === 0} onClick={onReset}>
                    {t("GENERAL.RESET")}
                </Button>
                <Button type="primary" size="small" onClick={onConfirm}>
                    {t("GENERAL.FILTER")}
                </Button>
            </div>
        </>
    );

    return (
        <div className={`ant-table-filter-dropdown`} onClick={(e) => e.stopPropagation()}>
            {dropdownContent}
        </div>
    );
});

export default FilterOverlay;
