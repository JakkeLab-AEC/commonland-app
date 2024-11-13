import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import {InspectorFixed} from "../../../components/inspector/inspectorFixed";
import {useModalOveralyStore} from '../../../homescreenitems/modalOverlayStore';
import {ButtonPositive} from '../../../components/buttons/buttonPositive';
import {ButtonNegative} from '../../../components/buttons/buttonNegative';
import { ThreeExporter } from "@/rendererArea/api/three/exporters/threeExporter";

interface ModalDxfExporterProp {
    mode: 'boring'|'topo';
}

interface BoringLocationProps {
    name: string,
    x: number,
    y: number,
}

export const ModalDxfExporter:React.FC<ModalDxfExporterProp> = ({mode}) => {
    const [boringLocations, setBoringLocations] = useState<Map<string, BoringLocationProps>>(new Map());
    const [boringSelectorVisibility, setBoringSelectorVisibility] = useState<boolean>(false);
    const [optionElements, setOptionElements] = useState<JSX.Element[]>([]);
    const tbFromXRef = useRef<HTMLInputElement>(null); 
    const tbFromYRef = useRef<HTMLInputElement>(null); 
    const tbToXRef = useRef<HTMLInputElement>(null); 
    const tbToYRef = useRef<HTMLInputElement>(null);

    const {
        toggleMode,
        resetProps,
    } = useModalOveralyStore();

    const onCloseNoActionHandler = () => {
        toggleMode(false);
        resetProps();
    }

    const onCloseWithActionHandler = async () => {
        // Get values
        const fromX = parseFloat(tbFromXRef.current.value);
        const fromY = parseFloat(tbFromYRef.current.value);
        const toX = parseFloat(tbToXRef.current.value);
        const toY = parseFloat(tbToYRef.current.value);

        const dx = toX - fromX;
        const dy = toY - fromY;

        // Actions
        const exporter = new ThreeExporter('euclidean');
        if(mode == 'boring') {
            await exporter.exportBoringsDXF('KOR', {dx: dx, dy: dy});
        } else {
            exporter.exportToposDXF('KOR', {dx: dx, dy: dy});
        }
        
        // Dispose
        toggleMode(false);
        resetProps();
    }

    const fetchAllBorings = async () => {
        const fetchJob = await window.electronBoringDataAPI.fetchAllBorings();
        if(!fetchJob || !fetchJob.result) return;

        const boringFetched = fetchJob.fetchedBorings.map(dto => {
            const boringProp: BoringLocationProps = {
                name: dto.name,
                x: dto.location.x,
                y: dto.location.y
            }

            return boringProp;
        });

        boringFetched.sort((a, b) => {
            const regex = /(\D+)(\d+)/;
            const [, aPrefix, aNumber] = a.name.match(regex) || [];
            const [, bPrefix, bNumber] = b.name.match(regex) || [];
    
            if (aPrefix === bPrefix) {
                return parseInt(aNumber, 10) - parseInt(bNumber, 10);
            } else {
                return aPrefix.localeCompare(bPrefix);
            }
        });

        const boringMap = new Map<string, BoringLocationProps>();
        
        boringFetched.forEach(boring => {
            boringMap.set(boring.name, boring);
        });

        return boringMap;
    }

    const onChangeBoringHandler = (e: ChangeEvent<HTMLSelectElement>) => {
        const boring = boringLocations.get(e.target.value)
        if(boring) {
            tbFromXRef.current.value = boring.x.toFixed(2);
            tbFromYRef.current.value = boring.y.toFixed(2);
        }
    }

    useEffect(() => {
        fetchAllBorings().then(res => {
            setBoringLocations(res);
            setBoringSelectorVisibility(true);

            const optionElements: JSX.Element[] = [];

            optionElements.push(...Array.from(res.values()).map((data, index) => {
                return (<option key={`${data.name}_${index}`} value={data.name}>{data.name}</option>)
            }));

            setOptionElements(optionElements);
        });
    }, []);

    return (
        <InspectorFixed title={"DXF 내보내기 옵션"} width={360} height={320} onClickCloseHandler={onCloseNoActionHandler}>
            <div className="p-2 flex flex-col gap-1 h-full w-full" style={{userSelect: 'none'}}>
                <div>
                    좌표 지정
                </div>
                <div className="flex flex-row w-full gap-2">
                    <div className="flex flex-col w-[50%] gap-1">
                        <div>
                            지정 점
                        </div>
                        <div className="flex flex-row">
                            <div className="w-[48px]">
                                X : 
                            </div>
                            <div>
                                <input 
                                    className="w-full border"
                                    type='number' 
                                    ref={tbFromXRef}
                                    defaultValue={0}/>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div className="w-[48px]">
                                Y : 
                            </div>
                            <div>
                                <input 
                                    className="w-full border"
                                    type='number' 
                                    ref={tbFromYRef}
                                    defaultValue={0}/>
                            </div>
                        </div>
                        { boringSelectorVisibility && <div className="flex flex-row">
                            <div className="w-[120px]">
                                가져오기
                            </div>
                            <div className="w-full">
                                <select className="w-full border" size={5} onChange={onChangeBoringHandler}>
                                    {optionElements}
                                </select>
                            </div>
                        </div>}
                    </div>
                    <div className="w-[24px] font-extrabold">
                        →
                    </div>
                    <div className="flex flex-col w-[50%] gap-1">
                        <div>
                            대상 점
                        </div>
                        <div className="flex flex-row">
                            <div className="w-[48px]">
                                X : 
                            </div>
                            <div>
                                <input 
                                    className="w-full border"
                                    type='number' 
                                    ref={tbToXRef}
                                    defaultValue={0}/>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div className="w-[48px]">
                                Y : 
                            </div>
                            <div>
                                <input 
                                    className="w-full border"
                                    type='number' 
                                    ref={tbToYRef}
                                    defaultValue={0}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-auto self-end flex flex-row gap-2">
                    <ButtonPositive text={"확인"} isEnabled={true} onClickHandler={onCloseWithActionHandler} width={48}/>
                    <ButtonNegative text={"취소"} isEnabled={true} onClickHandler={onCloseNoActionHandler} width={48}/>
                </div>
            </div>
        </InspectorFixed>
    )
}