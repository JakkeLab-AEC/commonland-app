import React, { ChangeEvent, useEffect, useRef } from "react"
import { useTopoMakerStore } from "../inspector/inspectorTopoMakerStore";
import {StatusLabel} from '@/rendererArea/components/status/statusLabel';

interface LayerSelectorProp {
    boringName: string,
    boringId: string,
    layerValues: {layerId: string, layerName: string, layerDepth: number}[],
}

export const LayerSelector:React.FC<LayerSelectorProp> = ({boringName, boringId, layerValues}) => {
    const refs = useRef(new Map<string, HTMLInputElement | null>());
    const {
        selectValue,
        allDepths,
        selectedValues
    } = useTopoMakerStore();
    
    const onCheckItem = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.checked) {
            selectValue(boringId, e.target.value);
        }
    }

    const handleAddRef = (key: string) => (element: HTMLInputElement | null) => {
        if (element) {
          refs.current.set(key, element);
        } else {
          refs.current.delete(key); // 요소가 unmount되면 Map에서 삭제
        }
    };

    return (
        <div key={boringId} className="flex flex-col border gap-1 p-2" style={{width: '180px', minWidth: '180px'}}>
            <div className="flex flex-row">
                <div className="flex-grow">
                    {boringName}
                </div>
                <div>
                    <StatusLabel isRedLight={selectedValues.get(boringId) == null} redLightMessage={"선택 전"} greenLightMessage={"선택 완료"} />
                </div>
            </div>
            <hr/>
            <div className="flex-grow flex flex-col gap-1 overflow-auto">
                {layerValues.map(layer => {
                    return (
                    <label key={layer.layerId} className="flex flex-row]">
                        <input 
                            type="radio" 
                            className="mr-1" 
                            name={`${boringId}`} 
                            value={layer.layerId} 
                            onChange={onCheckItem} 
                            ref={handleAddRef(layer.layerId)} 
                            checked={selectedValues.get(boringId) == layer.layerId}/> 
                        <div className="flex-grow max-w-[84px]">
                            {layer.layerName.length > 7 ? layer.layerName.slice(0, 7) + '...' : layer.layerName} 
                        </div>
                        <div>
                            ({layer.layerDepth.toFixed(2)})
                        </div>
                    </label>
                    )
                })}
            </div>
        </div>
    )
}
