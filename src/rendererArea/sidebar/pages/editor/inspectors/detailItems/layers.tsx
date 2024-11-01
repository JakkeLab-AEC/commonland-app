import React, { useRef, useState } from "react";
import { LayerComponent } from "./layer";
import { LayerSetHeader } from "./layerHeader";
import { Layer } from "../../../../../../mainArea/models/serviceModels/boring/layer";

interface LayerSetProps {
    layers: Layer[]
    onCreate: () => void;
    onDelete: (id: string) => void;
    onChangeValueListner: (id: string, name: string, thickness: number) => void;
    updateLayers: (layers: Layer[]) => void,
}

export const LayerSet:React.FC<LayerSetProps> = ({layers, onDelete, onCreate, onChangeValueListner, updateLayers}) => {
    const [currentLayers, setLayers] = useState<Layer[]>(layers);
    const [targetItemIndex, setTargetItemIndex] = useState<number>(-1);
    const [isParentDragging, setParentDragging] = useState<boolean>(false);
    const parentRef = useRef<HTMLDivElement>(null);
    const onMouseDown = (e:React.MouseEvent<HTMLDivElement>) => {
        setParentDragging(true);
        parentRef.current.onmouseup = () => {
            setParentDragging(false);
        }

        parentRef.current.onmouseleave = () => {
            setParentDragging(false);
            setTargetItemIndex(-1);
        }
    }

    const listenStartIndex = (index: number) => {
        setTargetItemIndex(index);
    }

    const onMouseEnterChild = (e: React.MouseEvent<HTMLDivElement>) => {        
        if(!isParentDragging) return;

        moveLayer(targetItemIndex, parseInt(e.currentTarget.id));
        setTargetItemIndex(parseInt(e.currentTarget.id));

    }

    const onMouseLeaveChild = (e: React.MouseEvent<HTMLDivElement>) => {

    }

    const moveLayer = (from: number, to: number) => {
        if(from == to) return;
        const newLayers = [...currentLayers];
        const targetLayer = newLayers[from];
        newLayers[from] = newLayers[to];
        newLayers[to] = targetLayer;

        updateLayerArrange(newLayers);
    }

    const updateLayerArrange = (updatedLayers: Layer[]) => {
        layers = updatedLayers;
        setLayers(updatedLayers); 
        updateLayers(updatedLayers);
    }

    const LayerComponents = currentLayers.map((layer, index) => {
        const isTarget = targetItemIndex === index;

        return(
            <div 
                id={`${index}`}
                className={`${isTarget && isParentDragging ? 'rounded bg-sky-200 transition cursor-grabbing' : 'transition cursor-default'}`}
                onMouseEnter={onMouseEnterChild}
                onMouseLeave={onMouseLeaveChild}
                key={layer.elementId.getValue()}>
                <LayerComponent
                    key={layer.elementId.getValue()}
                    layerId={layer.elementId.getValue()}
                    layerName={layer.getName()}
                    thickness={layer.getThickness()}
                    onDelete={onDelete}
                    onChangeValueListener={onChangeValueListner}
                    onMouseDown={onMouseDown}
                    listenStartIndex={listenStartIndex} index={index}/>
            </div>
        )
    });

    return (
        <div className="h-full">
            <LayerSetHeader onCreate={onCreate}/>
            <hr/>
            <div className="flex flex-col h-full gap-1 mt-1" style={{overflowY: 'auto'}} ref={parentRef}>
                {LayerComponents}
            </div>
        </div>
    )
}
