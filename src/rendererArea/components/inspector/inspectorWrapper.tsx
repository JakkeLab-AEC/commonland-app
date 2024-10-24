import React, { ReactNode, useState } from "react"
import { Inspector } from "./inspector"
import { useHomeStore } from "../../../rendererArea/homeStatus/homeStatusModel";


export const InspectorWrapper:React.FC = () => {
    const {
        inspectorVisibility,
        inspectorTitle,
        inspetorContent,
        inspectorSize,
        inspectorPositonTop,
        inspectorPositonLeft,
        setInspectorVisiblity,
    } = useHomeStore();
    
    const onCloseHandler = () => {
        setInspectorVisiblity(false);
    }

    return (
        <div style={{ position: 'absolute', top: inspectorPositonTop, left: inspectorPositonLeft }}>
            {inspectorVisibility && 
            <Inspector 
                title={inspectorTitle} 
                width={inspectorSize.width} 
                height={inspectorSize.height} 
                onClickCloseHandler={onCloseHandler} 
                children={inspetorContent} />}
        </div>
    )
}
