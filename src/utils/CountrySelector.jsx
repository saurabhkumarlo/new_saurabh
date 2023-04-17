import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Select } from "antd";
import countries from "./countries.json";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const CountrySelector = ({ country, setCountry, disabled }) => {
    const { t } = useTranslation();

    return (
        <Select
            suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
            disabled={disabled}
            showSearch
            placeholder={` -- ${t("GENERAL.SELECT_COUNTRY")} --`}
            value={country && country}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(e) => setCountry(e)}
            allowClear={false}
        >
            {countries.countries &&
                countries.countries.map((country) => (
                    <Option value={country.name} key={country.name}>
                        {country.name}
                    </Option>
                ))}
        </Select>
    );
};

export default CountrySelector;
