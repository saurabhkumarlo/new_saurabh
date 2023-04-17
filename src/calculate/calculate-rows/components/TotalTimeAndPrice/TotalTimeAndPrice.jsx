import { Col, Divider } from "antd";
import React from "react";
import { AuthenticationStore, CalculationStore } from "stores";
import { Input } from "..";

const TotalTimeAndPrice = ({ annotationRows, filterState }) => {
    const role = AuthenticationStore.getRole();

    const filterRows = (rows, activeFilters) =>
        activeFilters.reduce((acc, { key, selectedValues }) => acc.filter((row) => selectedValues.some((value) => value === row?.[key])), rows);

    const calcTotalPrice = (annotRows, activeFilters) => {
        const rows = activeFilters.length > 0 ? filterRows(annotRows, activeFilters) : annotRows;
        let totalPrice = 0;
        if (rows && rows.length) {
            rows.forEach((row) => {
                const rowTotalPrice = row?.totalPrice ? row?.totalPrice * 1 : 0;
                totalPrice += rowTotalPrice;
            });
        }
        return CalculationStore.formatCurrencyValue(totalPrice.toString());
    };

    const calcTotalTime = (annotRows, activeFilters) => {
        const rows = activeFilters.length > 0 ? filterRows(annotRows, activeFilters) : annotRows;
        if (rows && rows.length) {
            let allMinutes = 0;
            let totalHours = 0;
            let totalMinutes = 0;

            rows.forEach((row) => {
                const timeArray = row?.totalTime ? row?.totalTime.split(":") : ["00", "00"];
                const rowTotalTime = Math.abs(timeArray[0] * 60) + timeArray[1] * 1;

                if (timeArray[0].charAt(0) === "-") {
                    allMinutes -= rowTotalTime;
                } else {
                    allMinutes += rowTotalTime;
                }
            });

            if (allMinutes < 0) {
                totalHours = Math.ceil(allMinutes / 60);
            } else {
                totalHours = Math.floor(allMinutes / 60);
            }
            totalMinutes = Math.abs(allMinutes % 60);

            return `${allMinutes < 0 && totalHours === 0 ? "-" : ""}${totalHours}:${totalMinutes.toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
            })}`;
        } else {
            return "0:00";
        }
    };

    return (
        <>
            {role && (
                <>
                    <Col>
                        <Input readOnly value={calcTotalPrice(annotationRows, filterState)} className="Calculate_Rows_Currency" />
                    </Col>
                    <Divider type="vertical" style={{ height: "100%" }} />
                </>
            )}
            <Col>
                <Input readOnly value={calcTotalTime(annotationRows, filterState)} className="Calculate_Rows_Currency" />
            </Col>
        </>
    );
};

export default TotalTimeAndPrice;
