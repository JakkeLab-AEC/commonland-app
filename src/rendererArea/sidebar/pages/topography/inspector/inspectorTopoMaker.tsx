import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import {LayerSelector} from '../components/layerSelector';
import {D3LineChart} from '../../../../api/d3chart/d3linechart';
import { ButtonPositive } from "@/rendererArea/components/forms/buttons/buttonPositive";
import { ButtonNegative } from "@/rendererArea/components/forms/buttons/buttonNegative";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import { DepthType, useTopoMakerStore } from "./inspectorTopoMakerStore";
import { ColorIndexPalette, ColorSquare } from "@/rendererArea/components/forms/palette/colorIndexPalette";
import { Inspector } from "@/rendererArea/components/forms/inspector/inspector";
import { TopoType } from "@/mainArea/models/topoType";
import { TopoCreationOptions } from "../options";
import { Vector3d } from "@/mainArea/types/vector";
import { ModalLoading } from "@/rendererArea/components/forms/loadings/modalLoading";

interface InspectorTopoMakerProp {
    onSubmitTopo?: (options: TopoCreationOptions) => void;
    onClickClose?: () => void;
}

export const InspectorTopoMaker:React.FC<InspectorTopoMakerProp> = ({onSubmitTopo, onClickClose}) => {
    const nameRef = useRef<HTMLInputElement>(null);
    const resolutionRef = useRef<HTMLInputElement>(null);
    const [isPlatteOpened, setPaletteState] = useState<boolean>(false);
    const [topoColorIndex, setTopoColorIndex] = useState<number>(1);
    const [topoCreationMode, setTopoCreationMode] = useState<TopoType>(TopoType.NotDefined)
    const [offset, setOffset] = useState<number>(0);
    const [selectedBoundaryId, setBoundaryId] = useState<string>();

    const {
        allDepths,
        allLayerNames,
        selectedValues,
        fetchedBoundaries,
        fetchAllDepths,
        selectValue,
        unselectValue,
        reset,
    } = useTopoMakerStore();

    const onSubmit = async () => {
        const topoName = nameRef.current.value;
        if(topoName.length == 0) {
            await window.electronSystemAPI.callDialogError('지형면 생성 오류', '지형면 이름은 공백으로 설정할 수 없습니다.');
            return;
        }

        if(selectedValues.size == Array.from(selectedValues.values()).filter(value => value != null).length) {
            const pts: Vector3d[] = [];
            selectedValues.forEach((value, key) => {
                const targetBoring = allDepths.find(depth => depth.boringId === key);
                let level:number;
                if(typeof value === "number") {
                    console.log("Custom level");
                    level = value;
                } else {
                    level = targetBoring.layers.find(layer => layer.layerId === value).layerDepth;
                }
                
                pts.push({
                    x: targetBoring.location.x,
                    y: targetBoring.location.y,
                    z: level
                });
            });
            console.log(pts);

            const option: TopoCreationOptions = {
                name: topoName,
                isBatched: false,
                topoType: topoCreationMode,
                colorIndex: topoColorIndex,
                basePoints: pts,
                offset: offset,
                boundary: selectedBoundaryId === "none" ? undefined : fetchedBoundaries.get(selectedBoundaryId),
                resolution: parseFloat(resolutionRef.current.value),
            }

            if(onSubmitTopo) {
                onSubmitTopo(option);
            }
        } else {
            await window.electronSystemAPI.callDialogError('지형면 생성 오류', '모든 시추공에서 레이어를 선택헤 주세요');
        }
    };

    const [data, setData] = useState<{name: string, value: number}[]>([]);

    const updateData = () => {
        const depths:{name: string, value: number}[] = [];
        selectedValues.forEach((value, key) => {
            const targetBoring = allDepths.find(depth => depth.boringId == key);
            if(typeof value === "string") {
                const targetLayer = targetBoring.layers.find(layer => layer.layerId == value);
                depths.push({
                    name: targetBoring.boringName,
                    value: targetLayer?.layerDepth,
                })
            } else {
                depths.push({
                    name: targetBoring.boringName,
                    value: value
                })
            }
        });
        setData(depths);
    };

    const onSelectAllLayers = (e: ChangeEvent<HTMLSelectElement>) => {
        const layerName = e.target.value;
        const depthMap: Map<string, DepthType> = new Map();
        const boringIds = allDepths.map(d => {
            depthMap.set(d.boringId, d);
            return d.boringId;
        });

        if(layerName === 'topomaker-level-none') {
            boringIds.forEach(id => unselectValue(id));
            return;
        }

        boringIds.forEach(id => {
            const depth = depthMap.get(id);
            const targetLayer = depth.layers.find(ly => ly.layerName === layerName);
            if(targetLayer) {
                selectValue(id, targetLayer.layerId);
            } else {
                unselectValue(id);
            }
        });
    }

    const onClickRefreshGraph = () => {
        updateData();
    }

    const onClickSelectColor = (index: number) => {
        setTopoColorIndex(index);
        setPaletteState(false);
    }

    const onChangeCreationMode = (e: ChangeEvent<HTMLSelectElement>) => {
        const topoCreationType = e.target.value as TopoType;
        setTopoCreationMode(topoCreationType);
    }

    const onChangeBoundary = (e: ChangeEvent<HTMLSelectElement>) => {
        const boundaryId = e.target.value;
        setBoundaryId(boundaryId);
    }

    const onChangeOffset = (e: ChangeEvent<HTMLInputElement>) => {
        const offsetValue = parseInt(e.target.value);
        setOffset(offsetValue);
    }
    
    useEffect(() => {
        fetchAllDepths();

        return () => {
            reset();
        }
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Topo name */}
            <div className="flex flex-row p-2 gap-2 items-center">
                <div>
                    지형 이름
                </div>
                <div>
                    <input ref={nameRef} className="border"/>
                </div>
                <div>
                    지형 색상
                </div>
                <div>
                    <ColorSquare index={topoColorIndex} tooltipEnabled={true} onClickHandler={() => {setPaletteState(!isPlatteOpened)}} />
                </div>
                {isPlatteOpened && <div style={{position: 'absolute', left: 360, top: 20}}>
                    <Inspector title={"색상 선택"} width={240} height={260} onClickCloseHandler={() => setPaletteState(false)}>
                        <div className="self-center">
                            <ColorIndexPalette width={'full'} height={200} onClickHandler={onClickSelectColor} />
                        </div>
                    </Inspector>
                </div>}
                <div className="flex flex-row gap-2">
                    <div>
                        생성 방식
                    </div>
                    <div>
                        <select className="border w-[180px]" onChange={onChangeCreationMode}>
                            <option value={TopoType.DelaunayMesh}>Delaunay Mesh</option>
                            <option value={TopoType.OrdinaryKriging}>Ordinary Krige</option>
                        </select>
                    </div>
                </div>
                {(topoCreationMode !== TopoType.DelaunayMesh && topoCreationMode !== TopoType.NotDefined) && 
                <div className="flex flex-row gap-2">
                    <div>
                        해상도 (m)
                    </div>
                    <div className="border">
                        <input type="number" step={0.25} min={0.25} max={20} ref={resolutionRef} defaultValue={1}/>
                    </div>
                </div>}
                {(topoCreationMode !== TopoType.DelaunayMesh && topoCreationMode !== TopoType.NotDefined) &&
                <div className="flex flex-row gap-2">
                    <div>
                        경계선 설정
                    </div>
                    <select className="border w-[180px]" onChange={onChangeBoundary}>
                        <option value="none" key="boundary-none">선택하지 않음</option>
                        {Array.from(fetchedBoundaries.values())
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(item => {
                                return (
                                <option 
                                    value={item.id} 
                                    key={`boundary-${item.id}`}>
                                    {item.name}
                                </option>)
                            })}
                    </select>
                </div>}
                {(topoCreationMode === TopoType.OrdinaryKriging) && <div className="flex flex-row gap-2">
                    <div>
                        오프셋 (m)
                    </div>
                    <input className="border w-[80px]" type="number" min={0} step={1} defaultValue={0} onChange={onChangeOffset}/>
                </div>}
            </div>
            <hr/>
            {/* Layer selector */}
            <div className="flex flex-row items-center p-2 gap-2">
                <div className="flex-grow">높이 지정</div>
                <div className="">일괄 선택</div>
                <select className="border w-[132px]" onChange={onSelectAllLayers}>
                    <option key="topomaker-level-none">선택하지 않음</option>
                    <option key="topomaker-level-ungw">지하수위</option>
                    {allLayerNames.map(name => {
                        return (<option key={`topomaker-level-${name}`}>{name}</option>)
                    })}
                </select>
            </div>
            <div className="flex flex-row gap-1 border ml-2 mr-2 mb-2 p-2 h-full max-h-[280px]" style={{overflowX: 'auto'}}>
                {allDepths.map((depth) => {
                    return <LayerSelector
                        key={depth.boringId}
                        boringName={depth.boringName}
                        boringId={depth.boringId}
                        layerValues={depth.layers}
                    />
                })}
            </div>
            <hr />
            {/* Chart */}
            <div className="flex flex-row p-2">
                <div className="flex-grow">미리보기</div>
                <ButtonPositive text={"새로 고침"} isEnabled={true} width={72} onClickHandler={onClickRefreshGraph}/>
            </div>
            <hr />
            <div className="flex-grow">
                <D3LineChart data={data} />
            </div>
            <hr className="mt-auto"/>
            <div className="flex self-end gap-1 p-2 h-[36px]">
                <ButtonPositive text={"생성"} isEnabled={true} width={48} onClickHandler={onSubmit}/>
                <ButtonNegative text={"취소"} isEnabled={true} width={48} onClickHandler={onClickClose} />
            </div>
        </div>
    );
}
