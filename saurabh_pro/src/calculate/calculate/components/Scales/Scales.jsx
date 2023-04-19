import React, { useState } from "react";
import { AnnotationStore, AuthenticationStore, FileStore, ObjectsStore, ScaleStore } from "stores";
import { areBothScalesSet, getScalesFromAnnotationStore, saveScale } from "utils/scaleUtilMethods";
import { faRulerCombined, faRulerHorizontal, faRulerVertical } from "@fortawesome/free-solid-svg-icons";
import ScaleInput from "../ScaleInput";
import Immutable from "immutable";
import { X_SCALE_NAME, Y_SCALE_NAME } from "../../../../constants";
import { lengthValues } from "calculate/calculate/Calculate.utils";
import numeral from "numeral";
import i18n from "../../../../i18nextInitialized";
import AnnotationDeleteHandler from "utils/AnnotationDeleteHandler";
import { useParams } from "react-router-dom";
import { get } from "lodash";

const Scales = ({ activePage, lengthX, lengthY, setToolMode, setLengthX, setLengthY }) => {
    const [activeScaleButton, setActiveScaleButton] = useState(null);

    const role = AuthenticationStore.getRole();
    const deleteHandler = new AnnotationDeleteHandler();
    const { fileId } = useParams();
    const file = FileStore.getFileById(parseInt(fileId, 10));
    const fileType = get(file, "type");

    const setScaleTool = (scaleType) => {
        setToolMode(scaleType);
        if (scaleType === Y_SCALE_NAME) {
            AnnotationStore.setUseYScaleOnly(true);
        } else {
            AnnotationStore.setIsAltKeyEnabledForScale(!areBothScalesSet(activePage));
            AnnotationStore.setUseYScaleOnly(false);
        }

        setActiveScaleButton(scaleType);
        AnnotationStore.setToolMode("AnnotationCreateScale");
        const activeEstimateId = AnnotationStore.getActiveEstimate().get("id");
        ObjectsStore.selectScale({ scaleType, activeEstimateId, fileId, activePage });
    };

    const validateScale = (scaleType) => {
        const lengthType = lengthValues[scaleType] || null;
        const scaleProperties = ScaleStore.getScale(scaleType, activePage);
        if (lengthType === "lengthX" && parseFloat(lengthX) !== 0) {
            saveScale(scaleProperties, lengthX);
        }
        if (lengthType === "lengthY" && parseFloat(lengthY) !== 0) {
            saveScale(scaleProperties, lengthY);
        }
    };

    const onScaleDelete = (scaleType) => {
        const selectedScale = [ScaleStore.getScale(scaleType, activePage)];
        deleteHandler.deleteAnnotations(selectedScale);
    };

    const isNumeral = (value) => {
        numeral.locale(i18n.language);
        value = numeral(value);
        return !(!value && typeof value.value() !== "number" && value !== "");
    };

    const handleScaleChange = (e, scaleType) => {
        const value = e.target.value;
        if (value.length > 20) return false;
        if (isNumeral(Number(value)) || value.length === 0) {
            if (scaleType === Y_SCALE_NAME) {
                setLengthY(value);
            } else {
                setLengthX(value);
            }
        }
    };

    const isScaleAdded = () => {
        const { xScale, yScale } = getScalesFromAnnotationStore(activePage);

        return !!(xScale || yScale);
    };

    if (!role) return null;
    if (fileType === "ifc") return null;
    if (areBothScalesSet(activePage)) {
        return (
            <>
                <ScaleInput
                    activeScaleButton={activeScaleButton}
                    handleScaleChange={(e) => handleScaleChange(e, Y_SCALE_NAME)}
                    length={lengthY}
                    onIconClick={() => setScaleTool(Y_SCALE_NAME)}
                    scaleName={Y_SCALE_NAME}
                    validateScale={() => validateScale(Y_SCALE_NAME)}
                    value={lengthY}
                    icon={faRulerVertical}
                    onScaleDelete={() => onScaleDelete(Y_SCALE_NAME)}
                    activePage={activePage}
                    scaleType={Y_SCALE_NAME}
                    setLengthY={setLengthY}
                />
                <ScaleInput
                    activeScaleButton={activeScaleButton}
                    handleScaleChange={handleScaleChange}
                    length={lengthX}
                    onIconClick={() => setScaleTool(X_SCALE_NAME)}
                    scaleName={X_SCALE_NAME}
                    validateScale={() => validateScale(X_SCALE_NAME)}
                    value={lengthX}
                    icon={faRulerHorizontal}
                    onScaleDelete={() => onScaleDelete(X_SCALE_NAME)}
                    hideDeleteOption
                    activePage={activePage}
                    scaleType={X_SCALE_NAME}
                    setLengthX={setLengthX}
                />
            </>
        );
    }
    return (
        ScaleStore.getLength(X_SCALE_NAME) !== "" && (
            <div className={`${isScaleAdded() ? "Show_Scale" : "Hide_Scale"}`}>
                <ScaleInput
                    activeScaleButton={activeScaleButton}
                    handleScaleChange={handleScaleChange}
                    length={lengthX}
                    onIconClick={() => setScaleTool(X_SCALE_NAME)}
                    scaleName={X_SCALE_NAME}
                    validateScale={() => validateScale(X_SCALE_NAME)}
                    value={lengthX}
                    icon={faRulerCombined}
                    onScaleDelete={() => onScaleDelete(X_SCALE_NAME)}
                    activePage={activePage}
                    scaleType={X_SCALE_NAME}
                    setLengthX={setLengthX}
                />
            </div>
        )
    );
};

export default Scales;
