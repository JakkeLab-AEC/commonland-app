import React, { ChangeEvent, useCallback, useRef, useState } from "react"
import {ButtonPositive} from "../../../../../components/buttons/buttonPositive";
import { ContextMenu, ContextMenuItemProp } from "../../../../../components/contextmenu/contextMenu";
import { SPTResult, SPTResultSet } from "../../../../../../mainArea/models/serviceModels/boring/sptResult";
import { Inspector } from "../../../../../../rendererArea/components/inspector/inspector";
import { ButtonNegative } from "../../../../../../rendererArea/components/buttons/buttonNegative";
import { MultilineTextbox, MultilineTextboxHandle } from "@/rendererArea/components/multilineTextbox/multilineTextBox";

interface SPTResultUnitProp {
    id: string,
    depth: number,
    hitCount: number,
    distance: number,
    onChangeValueSet: (id: string, depth: number, hitCount: number, distance: number) => void,
}

export const SPTResultUnit:React.FC<SPTResultUnitProp> = ({id, depth, hitCount, distance, onChangeValueSet}) => {
    const hitCountRef = useRef<HTMLInputElement>(null);
    const distanceRef = useRef<HTMLInputElement>(null);
    
    
    const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
        onChangeValueSet(id, depth, parseFloat(hitCountRef.current.value), parseFloat(distanceRef.current.value));
    }
    
    return(
        <div className="flex flex-row">
            <div className="w-[48px]">
                {depth.toFixed(1)}
            </div>
            <div className="flex-1 flex flex-row gap-1">
                <div className="w-[36px]">
                    <input 
                        type="number" 
                        defaultValue={hitCount} 
                        className="w-[36px] border" 
                        min={1} 
                        max={99} 
                        maxLength={2}
                        onChange={onChangeValue}
                        ref={hitCountRef}/>
                </div>
                <div>/</div>
                <div className="w-[24px]">
                    <input 
                        type="number" 
                        defaultValue={distance} 
                        className="w-[36px] border" 
                        min={1} 
                        max={99} 
                        maxLength={2}
                        onChange={onChangeValue}
                        ref={distanceRef}/>
                </div>
            </div>
        </div>
    )
}

interface SPTResultSetProp {
    result: SPTResultSet;
    onChangeValueSetListner: (id: string, depth: number, hitCount: number, distance: number) => void;
}


const SPTResults: React.FC<SPTResultSetProp> = ({ result, onChangeValueSetListner }) => (
    <div className="flex flex-col gap-2 p-2 h-[300px]">
        {result.getAllResults().map((spt, index) => (
            <SPTResultUnit 
                id={spt.id}
                key={spt.id} 
                depth={spt.depth} 
                hitCount={spt.hitCount} 
                distance={spt.distance} 
                onChangeValueSet={onChangeValueSetListner}/>
        ))}
    </div>
);

interface SPTSheetProps {
    SPTResultSet: SPTResultSet
    onClickSetDepth?: (e: number) => void;
    onClickSetMultipleValues?: (e: Map<number, {hitCount: number, distance: number}>) => void;
    onChangeValueSetListner: (id: string, depth: number, hitCount: number, distance: number) => void;
}

export const SPTSheet:React.FC<SPTSheetProps> = ({SPTResultSet, onClickSetDepth, onClickSetMultipleValues, onChangeValueSetListner}) => {
    const [contextMenuVisibility, toggleContextMenu] = useState<boolean>(false);
    const [sptDepthVisibility, setSptDepthVisibility] = useState<boolean>(false);
    const [sptMultilineVisibility, setSptMultilineVisibility] = useState<boolean>(false);
    const depthRef = useRef<HTMLInputElement>(null);
    const multilineTextboxRef = useRef<MultilineTextboxHandle | null>(null);

    const showContextMenu = () => {
        toggleContextMenu(!contextMenuVisibility);
    }

    const closeContextMenu = () => {
        toggleContextMenu(false);
    }

    //#region SPTRange
    const SPTRangeWindow = () => {
        return (
        <div style={{position: 'absolute', left: 452}}>
            <Inspector title={"SPT 범위설정"} width={160} height={116} onClickCloseHandler={closeSPTRangeWindow}>
                <div className="flex flex-col p-2 gap-2">
                    <div className="flex flex-row gap-2">
                        <div className="flex w-[48px] flex-grow">
                            깊이
                        </div>
                        <div className="flex">
                            <input
                                className="border w-[92px]"
                                type='number'
                                defaultValue={1}
                                min={1}
                                ref={depthRef} />
                        </div>
                    </div>
                    <div className="flex gap-2 self-end">
                        <ButtonPositive text={"설정"} isEnabled={true} width={32} onClickHandler={onClickSubmitRange}/>
                        <ButtonNegative text={"취소"} isEnabled={true} width={32} onClickHandler={closeSPTRangeWindow}/>
                    </div>
                </div>
            </Inspector>
        </div>
    )}

    const openSPTRangeWindow = () => {
        if(sptMultilineVisibility) {
            setSptMultilineVisibility(false);
        }
        setSptDepthVisibility(true);
    }

    const closeSPTRangeWindow = () => {
        setSptDepthVisibility(false);
    }
    //#endregion

    //#region SPTMultiline
    interface SPTMultiLineWindowProp {
        values?: SPTResultSet
    }

    const SPTMultiLineInputWindow:React.FC<SPTMultiLineWindowProp> = ({values}) => {
        const convertedValues = values.getAllResults()
            .sort((a, b) => a.depth - b.depth)
            .map(spt => `${spt.hitCount}/${spt.distance}`);
        
        return (
            <div style={{position: 'absolute', left: 452}}>
                <Inspector title={"SPT 다중입력"} width={200} height={360} onClickCloseHandler={closeSPTMultilineWindow}>
                    <div className="flex flex-col h-full gap-1 p-2">
                        <div className="flex h-full">
                            <MultilineTextbox height={'100%'} width={'100%'} maxCharsPerLine={8} ref={multilineTextboxRef} values={convertedValues}/>
                        </div>
                        <div className="flex flex-row self-end gap-1">
                            <ButtonPositive text={"저장"} isEnabled={true} width={40} onClickHandler={onSubmitSPTMultipleLines}/>
                            <ButtonNegative text={"취소"} isEnabled={true} width={40} onClickHandler={closeSPTMultilineWindow}/>
                        </div>
                    </div>
                </Inspector>
            </div>
        )
    }

    const onSubmitSPTMultipleLines = () => {
        const contents = multilineTextboxRef.current.submitContent();
        const pattern = /^[1-9]\d*\/[1-9]\d*$/;
        const falseValue: {index: string, content: string}[] = [];
        contents.forEach((content, index) => {
            const testResult = pattern.test(content);
            if(!testResult) {
                falseValue.push({index: (index+1).toFixed(1), content: content});
            }
        });
        

        if(falseValue.length > 0) {
            const alertValue:string[] = [];
            falseValue.map((value, index) => {
                if(index != falseValue.length -1){
                    alertValue.push([value.index, value.content].join(':'));
                    alertValue.push('\n');
                } else {
                    alertValue.push([value.index, value.content].join(':'));
                }
            });
            const alertValueJoined = alertValue.join();
            alert(`일부 값의 형식이 잘못되었습니다.\n자연수/자연수 형태로 입력해주세요\n${alertValueJoined}`);
            return;
        }
        const result: Map<number, {hitCount: number, distance: number}> = new Map()
        contents.map((content, index) => {
            const splitted = content.split('/');
            result.set(index+1, {hitCount: parseInt(splitted[0]), distance: parseInt(splitted[1])});
        })

        if(onClickSetMultipleValues){
            onClickSetMultipleValues(result);
            setSptMultilineVisibility(false);
        }
    };

    const openSPTMultilineWindow = () => {
        if(sptDepthVisibility) {
            setSptDepthVisibility(false);
        }
        setSptMultilineVisibility(true);
    }

    const closeSPTMultilineWindow = () => {
        setSptMultilineVisibility(false);
    }
    //#endregion

    const onClickSubmitRange = () => {
        if(onClickSetDepth && depthRef.current) {
            onClickSetDepth(parseFloat(depthRef.current.value));
        }

        closeSPTRangeWindow();
    }

    const contextMenuItemProps:ContextMenuItemProp[] = [
        {displayString: '깊이설정', isActionIdBased: false, closeHandler: closeContextMenu, action: openSPTRangeWindow},
        {displayString: '다중입력', isActionIdBased: false, closeHandler: closeContextMenu, action: openSPTMultilineWindow},
    ];

    return (
        <div className="flex flex-col flex-grow" style={{height: '100%'}}>
            <div className="flex items-center p-2 border-b">
                <div className="w-1/4 font-semibold">심도</div>
                <div className="flex-grow font-semibold">N치 (회/cm)</div>
                <ButtonPositive text={"..."} width={32} onClickHandler={showContextMenu} isEnabled={true}/>
            </div>
            <div className="flex flex-grow" style={{overflowY: 'auto'}}>
                <SPTResults result={SPTResultSet} onChangeValueSetListner={onChangeValueSetListner} />
            </div>
            {contextMenuVisibility && 
            <div style={{top: 44, right: 60, position: 'absolute'}}>
                <ContextMenu menuItemProps={contextMenuItemProps} width={120} onClose={closeContextMenu}/>
            </div>}
            {sptDepthVisibility && <SPTRangeWindow />}
            {sptMultilineVisibility && <SPTMultiLineInputWindow values={SPTResultSet} />}
        </div>
    );
}
