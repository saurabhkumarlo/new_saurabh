import React from "react";
import { useTranslation } from "react-i18next";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    const { t } = useTranslation();
    return (
        <div role="alert">
            <p>{`${t("GENERAL.SOMETHING_WENT_WRONG")}:`}</p>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>{t("GENERAL.TRY_AGAIN")}</button>
        </div>
    );
};

export default ErrorFallback;
