import "./setTilesModal.less";

import { Button, Col, Input, Row } from "antd";
import { Checkbox, Divider, Modal } from "../../../../../../components";
import { default as React, useState } from "react";
import { chceckboxFileds, jointInputFields, tileInputFields } from "./SetTilesModal.utils";

import { useTranslation } from "react-i18next";

const SetTilesModal = ({ modalVisible, cancelModal, onSubmit, netSelection, onSelectionChange, annotationsTiles, displayArea = true }) => {
    const { t } = useTranslation();
    const [tiles, setTiles] = useState(annotationsTiles);
    const MIN_INPUT_VAL = 0;
    const updateTiles = (e, name) => {
        setTiles({
            ...tiles,
            [name]: e.target.value,
        });
    };

    const onCancel = () => {
        setTiles(annotationsTiles);
        cancelModal();
    };

    const onOkHandler = () => {
        const closeDialog = true;
        onSubmit(tiles, closeDialog);
    };

    const onClearHandler = () => {
        for (var key in tiles) {
            if (tiles.hasOwnProperty(key)) {
                tiles[key] = 0;
            }
        }
        const closeDialog = false;
        onSubmit(tiles, closeDialog);
    };

    const isOkButtonDisabled =
        tiles &&
        ((netSelection === "netWall" && (!tiles.wallJointDepth || !tiles.wallJointX || !tiles.wallJointY || !tiles.wallTileX || !tiles.wallTileY)) ||
            (netSelection === "netArea" && (!tiles.areaJointDepth || !tiles.areaJointX || !tiles.areaJointY || !tiles.areaTileX || !tiles.areaTileY)));

    if (!tiles) return null;

    return (
        <Modal
            visible={modalVisible}
            title={t("ESTIMATE.SET_TILES")}
            onCancel={onCancel}
            className="Tiles_Modal"
            closable
            footer={[
                <Button key="1" type="link" onClick={onCancel}>
                    {t("GENERAL.CANCEL")}
                </Button>,
                <Button key="2" onClick={onClearHandler}>
                    {t("ESTIMATE.CLEAR_TILES")}
                </Button>,
                <Button key="3" type="primary" onClick={onOkHandler} disabled={isOkButtonDisabled}>
                    {t("ESTIMATE.SET_TILES")}
                </Button>,
            ]}
        >
            <Row justify="space-around">
                {displayArea ? (
                    <Col span={6}>
                        {chceckboxFileds.map(({ name, label, selection }) => (
                            <Col span={24} offset={2} key={name}>
                                <Checkbox name={name} label={t(label)} onChange={() => onSelectionChange(selection)} checked={netSelection === selection} />
                            </Col>
                        ))}
                    </Col>
                ) : (
                    <Col span={6}>
                        <Col span={24} offset={2}>
                            <Checkbox name="wallChecked" label={t("ESTIMATE.NET_WALL")} onChange={() => onSelectionChange("netWall")} checked={true} />
                        </Col>
                    </Col>
                )}
                <Col span={1} offset={1}>
                    <Divider vertical />
                </Col>
                <Col span={6}>
                    {tileInputFields.map(
                        ({ name, label, selection }) =>
                            netSelection === selection && (
                                <Row key={`${name}${selection}`}>
                                    <Col span={24}>{t(label)}</Col>
                                    <Col span={24}>
                                        <Input type="number" value={tiles[name]} min={MIN_INPUT_VAL} onChange={(e) => updateTiles(e, name)} />
                                    </Col>
                                </Row>
                            )
                    )}
                </Col>
                <Col span={1} offset={1}>
                    <Divider vertical />
                </Col>
                <Col span={6}>
                    {jointInputFields.map(
                        ({ name, label, selection }) =>
                            netSelection === selection && (
                                <Row key={`${name}${selection}`}>
                                    <Col span={24}>{t(label)}</Col>
                                    <Col span={24}>
                                        <Input type="number" value={tiles[name]} min={MIN_INPUT_VAL} onChange={(e) => updateTiles(e, name)} />
                                    </Col>
                                </Row>
                            )
                    )}
                </Col>
            </Row>
        </Modal>
    );
};

export default SetTilesModal;
