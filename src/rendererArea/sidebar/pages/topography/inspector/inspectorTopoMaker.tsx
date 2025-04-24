import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import {LayerSelector} from '../components/layerSelector';
import {D3LineChart} from '../../../../api/d3chart/d3linechart';
import { ButtonPositive } from "@/rendererArea/components/buttons/buttonPositive";
import { ButtonNegative } from "@/rendererArea/components/buttons/buttonNegative";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import { useTopoMakerStore } from "./inspectorTopoMakerStore";
import { ColorIndexPalette, ColorSquare } from "@/rendererArea/components/palette/colorIndexPalette";
import { Inspector } from "@/rendererArea/components/inspector/inspector";
import { TopoType } from "@/mainArea/models/topoType";
import { TopoCreationOptions } from "../options";
import { Vector3d } from "@/mainArea/types/vector";

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
    const [selectedBoundaryId, setBoundaryId] = useState<string>();
    const {
        toggleMode,
        resetProps
    } = useModalOveralyStore();

    const {
        allDepths,
        allLayerNames,
        selectedValues,
        fetchedBoundaries,
        fetchAllDepths,
        selectOnce,
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
                const targetBoring = allDepths.find(depth => depth.boringId == key);
                pts.push({
                    x: targetBoring.location.x,
                    y: targetBoring.location.y,
                    z: targetBoring.layers.find(layer => layer.layerId == value).layerDepth
                });
            });

            const option: TopoCreationOptions = {
                name: topoName,
                isBatched: false,
                topoType: topoCreationMode,
                colorIndex: topoColorIndex,
                basePoints: pts,
                boundary: selectedBoundaryId === "none" ? undefined : fetchedBoundaries.get(selectedBoundaryId)
            }

            if(onSubmitTopo) {
                onSubmitTopo(option);
            }

            toggleMode(false);
        } else {
            await window.electronSystemAPI.callDialogError('지형면 생성 오류', '모든 시추공에서 레이어를 선택헤 주세요');
        }
    };

    const [data, setData] = useState<{name: string, value: number}[]>([]);

    const updateData = () => {
        const depths:{name: string, value: number}[] = [];
        selectedValues.forEach((value, key) => {
            const targetBoring = allDepths.find(depth => depth.boringId == key);
            const targetLayer = targetBoring.layers.find(layer => layer.layerId == value);
            depths.push({
                name: targetBoring.boringName,
                value: targetLayer?.layerDepth,
            })
        });
        setData(depths);
    };

    const onSelectAllLayers = (e: ChangeEvent<HTMLSelectElement>) => {
        selectOnce(e.target.value);
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
    
    useEffect(() => {
        fetchAllDepths();

        return () => {
            reset();
            resetProps();
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
            </div>
            <hr/>
            {/* Layer selector */}
            <div className="flex flex-row items-center p-2 gap-2">
                <div className="flex-grow">높이 지정</div>
                <div className="">일괄 선택</div>
                <select className="border w-[132px]" onChange={onSelectAllLayers}>
                    <option>선택하지 않음</option>
                    <option>지하수위</option>
                    {allLayerNames.map(name => {
                        return (<option>{name}</option>)
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
