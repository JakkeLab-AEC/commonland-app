import { useLanguageStore } from "../../../../language/languageStore";
import { ButtonNegative } from "../../../../components/buttons/buttonNegative";
import {ButtonPositive} from "../../../../components/buttons/buttonPositive";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FoldableControl } from "../../../../components/foldableControl/foldableControl";
import React from "react";
import { LayerSet } from "./detailItems/layers";
import { SPTSheet } from "./detailItems/sptSheet";
import { Boring } from "../../../../../mainArea/models/serviceModels/boring/boring";
import { useHomeStore } from "../../../../commonStatus/homeStatusModel";
import { Layer } from "../../../../../mainArea/models/serviceModels/boring/layer";
import { SPTResult, SPTResultSet } from "../../../../../mainArea/models/serviceModels/boring/sptResult";
import { useEditorPageStore } from "../EditorPageStore";
import { ThreeBoringPost } from "@/rendererArea/api/three/predefinedCreations/boringPost";
import { SceneController } from "@/rendererArea/api/three/SceneController";

interface BoringEditorProps {
    boring: Boring
    isNewCreated: boolean;
}

const compareDistance = (target: Boring, compareTo: Boring, tolerance: number = 0.5):boolean => {
    const toleranceCheck = Math.sqrt(
        Math.pow(compareTo.getLocationX() - target.getLocationX(), 2) + 
        Math.pow(compareTo.getLocationY() - target.getLocationY(), 2)
    ) > tolerance;

    return toleranceCheck;
}

export const InspectorBoringEdit: React.FC<BoringEditorProps> = ({boring, isNewCreated}) => {
    const { findValue } = useLanguageStore();
    const {
        setInspectorVisiblity,
        setInspectorTitle,
    } = useHomeStore();
    const {
        insertBoring,
        updateBoring,
        registerUpdateEventListner,
        searchBoringName,
        fetchAllBorings,
        fetchAllLayerColors,
        borings,
        layerColorConfig
    } = useEditorPageStore();

    const [currentLayers, setLayers] = useState<Layer[]>(boring.getLayers());
    const [currentSPTResult] = useState<SPTResultSet>(boring.getSPTResultSet());
    const tbBoringName = useRef<HTMLInputElement>(null);
    const tbCoordXRef = useRef<HTMLInputElement>(null);
    const tbCoordYRef = useRef<HTMLInputElement>(null);
    
    const onClickCancel = () => {
        setInspectorVisiblity(false);
    }

    const onClickSave = async () => {
        // Layer check
        if(boring.getLayers().length == 0) {
            alert('레이어는 1개이상 배치해야 합니다.');
            return;
        }

        // Name Check
        const newName = boring.getName();
        if(newName.length == 0 || newName.trim().length == 0) {
            alert('이름은 공란이나 여백으로 만들 수 없습니다.')
            return;
        }
        
        const searchNameJob = await searchBoringName(boring.getName(), boring.getId().getValue());
        if(searchNameJob == 'found') {
            alert('이미 사용중인 시추공 이름입니다.');
            return;
        }

        if(searchNameJob == 'internalError') {
            alert('시스템 내부 오류.');
            return;
        }
            

        let isAllLayerNameIsNotBlank = true;
        const invalidLayerNames: string[] = [];
        let isAllLayerValidThickness = true;
        const invalidLayerThicknesses: string[] = [];
        for(const layer of boring.getLayers()){
            if(layer.getName().length == 0) {
                isAllLayerNameIsNotBlank = false;
                invalidLayerNames.push(layer.getName());
            }

            if(layer.getThickness() <= 0) {
                isAllLayerValidThickness = false;
                invalidLayerNames.push(layer.getName());
            }
        }

        if(!isAllLayerNameIsNotBlank || !isAllLayerValidThickness) {
            let alertMessage = '유효하지 않은 레이어 항목이 있습니다.\n';
        
            if(invalidLayerNames.length > 0) {
                alertMessage += `- 공란인 레이어 발생\n`;
            }
        
            if(invalidLayerThicknesses.length > 0) {
                alertMessage += `- 유효하지 않은 레이어 두께 (0 이하): ${invalidLayerThicknesses.join(', ')}\n`;
            }
        
            alertMessage += '해당 항목을 확인해 주세요.';
            alert(alertMessage);
        
            return;
        }

        // Check distances
        let toleranceCheckResult = true;
        const compareTargets = Array.from(borings.values()).filter(targets => targets.getId().getValue() != boring.getId().getValue());
        for(const createdBoring of compareTargets) {
            if(!compareDistance(boring, createdBoring)) {
                toleranceCheckResult = false;
                break;
            }
        }

        if(!toleranceCheckResult) {
            alert('인접한 시추공과 0.5m 이상 떨어져있어야 합니다.');
            return;
        }

        // Create and insert
        const newInspectorWindowTitle = `${findValue('BoringEditor', 'editorHeaderEdit')} : ${boring.getName().length > 16 ? boring.getName().substring(0, 15)+'...' : boring.getName()}`;
        const updateInspectorTitle = () => {
            setInspectorTitle(newInspectorWindowTitle)
        }
        registerUpdateEventListner(updateInspectorTitle);

        if(isNewCreated) {
            const insertJob = await insertBoring(boring);
            if(!insertJob) return;

            await fetchAllBorings();
            setInspectorVisiblity(false);
        } else {
            const updateJob = await updateBoring(boring);
            if(!updateJob) {
                return;
            }

            await fetchAllBorings();
        }
    }

    const onDeleteLayer = (id: string) => {
        boring.removeLayer(id);
        setLayers([...boring.getLayers()]);
    }

    const onCreateLayer = () => {
        const layer = new Layer('레이어', 1);
        boring.addLayer(layer);
        setLayers([...boring.getLayers()]);
    }

    const onClickSetSPTDepth = (depth: number) => {
        boring.getSPTResultSet().buildEmptySets(depth);
    }

    const onChangeSPTValueHandler = (id: string, depth: number, hitCount: number, distance: number) => {
        boring.getSPTResultSet().updateResult(depth, new SPTResult(depth, hitCount, distance));
    }

    const onChangeLayerValueHandler = (id: string, name: string, thickness: number) => {
        boring.updateLayer(id, name, thickness);
    }

    const onChangeTopoTopHandler = (e:ChangeEvent<HTMLInputElement>) => {
        boring.setTopoTop(parseFloat(e.target.value));
    }

    const onChangeUndergroundWaterHander = (e:ChangeEvent<HTMLInputElement>) => {
        boring.setUndergroundWater(parseFloat(e.target.value));
    }

    const onChangeCoordXHandler = (e:ChangeEvent<HTMLInputElement>) => {
        boring.setLocationX(parseFloat(e.target.value));
    }

    const onChangeCoordYHander = (e:ChangeEvent<HTMLInputElement>) => {
        boring.setLocationY(parseFloat(e.target.value));
    }

    const onChangeRenameHandler = (e:ChangeEvent<HTMLInputElement>) => {
        boring.setName(e.target.value);
    }

    const updateLayers = (layers: Layer[]) => {
        boring.updateLayersByArray(layers);
    }

    const onSubmitSPTMultipleLines = (e: Map<number, {hitCount: number; distance: number}>) => {
        boring.getSPTResultSet().buildByMultipleValues(e);
    }

    const onSwapCoordinate = () => {
        const [coordX, coordY] = [boring.getLocationX(), boring.getLocationY()];
        boring.setLocationX(coordY);
        boring.setLocationY(coordX);

        tbCoordXRef.current.value = coordY.toString();
        tbCoordYRef.current.value = coordX.toString();
    }

    useEffect(() => {

    }, [])

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-row flex-grow" style={{overflowY: 'hidden', borderBottomWidth: 1}}>
                {/* Left column with fixed height content */}
                <div className="flex flex-col w-[260px]" style={{borderRightWidth: 1}}>
                    {/* Boring name */}
                    <div className="flex flex-row p-2 gap-1">
                        <div className="w-[202px]">{findValue("BoringEditor", "boringNameHeader")}</div>
                        <input 
                            ref={tbBoringName} 
                            className="border w-full" 
                            defaultValue={boring.getName()}
                            onChange={onChangeRenameHandler}/>
                    </div>
                    <hr />
                    {/* Coordinates */}
                    <div className="grid grid-cols-[76px_1fr] p-2 gap-y-2">
                        <div>{findValue("BoringEditor", "boringCoordinate")}</div>
                        <div className="grid grid-cols-[28px_1fr] gap-x-2">
                            <div>X:</div>
                            <input 
                                className="border w-full" 
                                type="number" 
                                step={0.01} 
                                defaultValue={boring.getLocationX()}
                                onChange={onChangeCoordXHandler}
                                ref={tbCoordXRef} />
                        </div>
                        <div>
                            <ButtonPositive text={"변경"} isEnabled={true} onClickHandler={onSwapCoordinate}/>
                        </div>
                        <div className="grid grid-cols-[28px_1fr] gap-x-2">
                            <div>Y:</div>
                            <input 
                                className="border w-full" 
                                type="number" 
                                step={0.01} 
                                defaultValue={boring.getLocationY()}
                                onChange={onChangeCoordYHander}
                                ref={tbCoordYRef} />
                        </div>
                    </div>
                    <hr />
                    {/* EL, GL Levels */}
                    <div className="grid grid-cols-[76px_1fr] p-2 gap-y-2">
                        <div>{findValue("BoringEditor", "boringLevels")}</div>
                        <div className="grid grid-cols-[84px_1fr] gap-x-2">
                            <div>{findValue("BoringEditor", "elevation")} EL</div>
                            <input 
                                ref={tbBoringName} 
                                className="border w-full" 
                                type="number" 
                                step={0.01} 
                                defaultValue={boring.getTopoTop()} 
                                onChange={onChangeTopoTopHandler}/>
                        </div>
                        <div></div>
                        <div className="grid grid-cols-[84px_1fr] gap-x-2">
                            <div className="w-[192px]">{findValue("BoringEditor", "undergroundwater")} GL</div>
                            <input 
                                ref={tbBoringName} 
                                className="border w-full" 
                                type="number" 
                                step={0.01} 
                                defaultValue={boring.getUndergroundWater()} 
                                onChange={onChangeUndergroundWaterHander}/>
                        </div>
                    </div>
                    <hr />
                    {/* Layers */}
                    <div className="p-2 h-[320px]">
                        <LayerSet 
                            layers={currentLayers} 
                            onDelete={onDeleteLayer} 
                            onCreate={onCreateLayer}
                            onChangeValueListner={onChangeLayerValueHandler}
                            updateLayers={updateLayers}/>
                    </div>
                </div>
                <div className="flex flex-grow">
                    <SPTSheet 
                        onClickSetDepth={onClickSetSPTDepth}
                        onChangeValueSetListner={onChangeSPTValueHandler}
                        onClickSetMultipleValues={onSubmitSPTMultipleLines}
                        SPTResultSet={currentSPTResult}/>
                </div>
            </div>
            {/* Save buttons */}
            <div className="flex self-end flex flex-row gap-2 justify-end p-2">
                <ButtonPositive text={"저장"} width={48} isEnabled={true} onClickHandler={onClickSave}/>
                <ButtonNegative text={"취소"} width={48} isEnabled={true} onClickHandler={onClickCancel}/>
            </div>
        </div>
    );
};
