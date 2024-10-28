import React, { ChangeEvent } from "react"

interface LayerSelectorProp {
    boringName: string,
    boringId: string,
    layerValues: {layerId: string, layerName: string, level: number}[],
    onSubmit: (selection:{boringId: string, layerId: string, layerName: string|undefined, level: number}) => void,
}


export const LayerSelector:React.FC<LayerSelectorProp> = ({boringName, boringId, layerValues, onSubmit}) => {
    const onCheckItem = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.checked) {
            const targetLayer = layerValues.find(layer => layer.layerId == e.target.value);
            const layer = {
                boringId: boringId,
                layerId: e.target.value, 
                layerName: targetLayer?.layerName,
                level: targetLayer?.level
            }
            onSubmit(layer);
        }
    }

    return (
        <div key={boringId} className="flex flex-col border gap-1 p-2" style={{width: '180px', minWidth: '180px'}}>
            <div>
                {boringName}
            </div>
            <hr/>
            <div className="flex-grow flex flex-col gap-1">
                {layerValues.map(layer => {
                    return (
                    <label key={layer.layerId} className="flex flex-row">
                        <input type="radio" className="mr-1" name={`${boringId}`} value={layer.layerId} onChange={onCheckItem}/> 
                        <div className="flex-grow">
                            {layer.layerName} 
                        </div>
                        <div>
                            ({layer.level})
                        </div>
                    </label>
                    )
                })}
            </div>
        </div>
    )
}
