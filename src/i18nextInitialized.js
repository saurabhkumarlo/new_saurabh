import LOCALE_EN from "localisation/en/translations";
import LOCALE_NO from "localisation/no/translations";
import LOCALE_SV from "localisation/sv/translations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
    lng: localStorage.getItem("language") || "en",
    resources: {
        en: {
            translation: LOCALE_EN,
        },
        sv: {
            translation: LOCALE_SV,
        },
        no: {
            translation: LOCALE_NO,
        },
    },
    debug: false,
});

export default i18n;
