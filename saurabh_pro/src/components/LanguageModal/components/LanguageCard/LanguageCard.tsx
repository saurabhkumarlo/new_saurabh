import { Card, Col } from "antd";
import React from "react";

interface LanguageCardProps {
    label: string;
    className: string;
    onClick: (name: string) => any;
    name: string;
}

const LanguageCard = ({ label, name, className, onClick }: LanguageCardProps) => (
    <Col span={8}>
        <div onClick={() => onClick(name)} className="Card_Button">
            <Card>
                <div className="Flag_Icon_Wrapper">
                    <span className={`flag-icon Flag_Icon ${className}`} />
                </div>
                <div className="Flag_Icon_Name">
                    <h5>{label}</h5>
                </div>
            </Card>
        </div>
    </Col>
);

export default LanguageCard;
