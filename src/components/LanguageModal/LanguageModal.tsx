import "./language-modal.less";

import { Modal, Row } from "antd";

import { AuthenticationStore } from "stores";
import { LanguageCard } from "./components";
import React from "react";
import { map } from "lodash";

interface LanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const languages = [
    { label: "English", className: "flag-icon-gb", name: "en" },
    { label: "Svenska", className: "flag-icon-se", name: "sv" },
    { label: "Norsk", className: "flag-icon-no", name: "no" },
    /*     { label: "Danska", className: "flag-icon-dk", name: "da" },
    { label: "Nederlands", className: "flag-icon-nl", name: "nl" },
    { label: "Español, Castellano", className: "flag-icon-es", name: "es" }, */
];

const LanguageModal = ({ isOpen, onClose }: LanguageModalProps) => {
    const setLanguage = (language: string) => {
        AuthenticationStore.setLanguage(language);
        onClose();
        (window as any)._setupTawk();
    };

    return (
        <Modal visible={isOpen} className="Select_Language_Modal" width={800}>
            <Row gutter={[24, 24]}>
                {map(languages, (language) => (
                    <LanguageCard className={language.className} label={language.label} onClick={setLanguage} name={language.name} key={language.name} />
                ))}
            </Row>
        </Modal>
    );
};

export default LanguageModal;
