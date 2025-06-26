import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { useTopoMakerStore } from "../inspector/inspectorTopoMakerStore";
import {StatusLabel} from '@/rendererArea/components/forms/status/statusLabel';

interface LayerSelectorProp {
    boringName: string,
    boringId: string,
    layerValues: {layerId: string, layerName: string, layerDepth: number}[],
}

export const LayerSelector:React.FC<LayerSelectorProp> = ({boringName, boringId, layerValues}) => {
    const customLevelRef = useRef<HTMLInputElement>(null);
    const [isCustomMode, setCustomMode] = useState<boolean>(false);
    const {
        selectValue,
        selectedValues,
    } = useTopoMakerStore();
    
    const onCheckItem = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.checked) {
            const value = e.target.value;
            console.log(value);
            if(value === `${boringId}-depth-userdefined-custom`) {
                console.log("CustomLevel");
                const customLevel = parseFloat(customLevelRef.current.value);
                selectValue(boringId, customLevel);
                setCustomMode(true);
            } else {
                selectValue(boringId, value);
                setCustomMode(false);
            }
        }
    }

    const onTypeCustomLevel = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        selectValue(boringId, value);
    }

    return (
        <div key={boringId} className="flex flex-col border gap-1 p-2" style={{width: '180px', minWidth: '180px'}}>
            <div className="flex flex-row">
                <div className="flex-grow">
                    {boringName}
                </div>
                <div>
                    <StatusLabel 
                        isRedLight={!selectedValues.get(boringId)} 
                        redLightMessage={"선택 전"} 
                        greenLightMessage={"선택 완료"} />
                </div>
            </div>
            <hr/>
            <div className="flex-grow flex flex-col gap-1 overflow-auto">
                {layerValues.map(layer => {
                    return (
                    <label key={`${boringId}-${layer.layerId}`} className="flex flex-row">
                        <input
                            key={`depth-${boringId}-${layer.layerId}`}
                            type="radio"
                            className="mr-1" 
                            name={`${boringId}`} 
                            value={layer.layerId} 
                            onChange={onCheckItem} 
                            checked={selectedValues.get(boringId) === layer.layerId}/> 
                        <div className="flex-grow max-w-[84px]">
                            {layer.layerName.length > 7 ? layer.layerName.slice(0, 7) + '...' : layer.layerName} 
                        </div>
                        <div>
                            ({layer.layerDepth.toFixed(2)})
                        </div>
                    </label>
                    )
                })}
                <label key={`${boringId}-custom`} className="flex flex-row">
                    <input
                        key={`depth-${boringId}-custom`}
                        type="radio"
                        className="mr-1" 
                        name={`${boringId}`} 
                        value={`${boringId}-depth-userdefined-custom`} 
                        onChange={onCheckItem}/> 
                    <div className="flex flex-grow">
                        직접 입력
                    </div>
                    <div>
                        <input 
                            key={`depth-${boringId}-custom-input`}
                            className="border w-[60px] ml-auto" 
                            defaultValue={
                                Math.round(layerValues.map(v => v.layerDepth).sort((a,b) => a-b)[0] * 100) / 100
                            } 
                            type='number' 
                            onChange={onTypeCustomLevel}
                            disabled={!isCustomMode}
                            ref={customLevelRef}
                            maxLength={5}/>
                    </div>
                </label>
            </div>
        </div>
    )
}
