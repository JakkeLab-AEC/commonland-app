import { useHomeStore } from "../../../commonStatus/homeStatusModel";
import { ListBox } from "../../../components/forms/listbox/listBox"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { InspectorBoringEdit } from "./inspectors/inspectorBoringEdit";
import { useLanguageStore } from "../../../../rendererArea/language/languageStore";
import {ButtonPositive} from "../../../components/forms/buttons/buttonPositive";
import {ButtonNegative} from "../../../components/forms/buttons/buttonNegative";
import { useEditorPageStore } from "./EditorPageStore";
import { Boring } from "../../../../mainArea/models/serviceModels/boring/boring";
import { Layer } from "../../../../mainArea/models/serviceModels/boring/layer";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import {ModalSwapXY} from './modals/modalswapxy';
import { ColorIndexPalette } from "../../../components/forms/palette/colorIndexPalette";
import { FoldableControl} from "../../../components/forms/foldableControl/foldableControl"
import { ListInputBox } from "../../../components/forms/listbox/listInputBox";

interface InspectorContent {
    boring: Boring,
    isNewCreated: boolean,
}

const InspectorContent:React.FC<InspectorContent> = ({boring, isNewCreated}) => {
    return (<InspectorBoringEdit boring={boring.clone()} isNewCreated={isNewCreated}/>)
}

interface ColorPickerProps {
    targetId: string,
    onClickHandler: (index: number, targetId: string) => void;
}

const ColorPicker:React.FC<ColorPickerProps> = ({targetId, onClickHandler}) => {
    const onClickWrapper = (index: number) => {
        onClickHandler(index, targetId);
    }

    return (
        <div className="p-2">
            <ColorIndexPalette width={'full'} height={120} onClickHandler={onClickWrapper} />
        </div>
    )
}

export const BoringManager = () => {
    const prefixRef = useRef<HTMLInputElement>(null);
    const manualNameRef = useRef<HTMLInputElement>(null);
    const indexRef = useRef<HTMLInputElement>(null);
    const layerColorsRef = useRef<HTMLDivElement>(null);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [namingMode, setNamingMode] = useState<'manual'|'autoincrement'>('autoincrement');

    const {
        toggleMode,
        updateModalContent,
    } = useModalOveralyStore();

    const {
        findValue,
    } = useLanguageStore();
    
    const {
        setInspectorVisiblity,
        setInspectorTitle,
        setInspectorContent,
        setInspectorSize,
        setInspectorPosition,
        registerInspectorClosingListner,
        resetInspector,
        currentSidebarHeight
    } = useHomeStore();

    const {
        fetchAllBorings,
        selectBoring,
        searchBoringName,
        searchBoringNamePattern,
        removeBoring,
        unselectBoring,
        updateLayerColor,
        updateBoringDisplayItem,
        borings,
        boringDisplayItems,
        selectedBoringId,
        layerColorConfig,
        fetchAllLayerColors,
        updateBoring,
    } = useEditorPageStore();

    
    const onClickHandler = (id: string) => {
        const selectedBoring = selectBoring(id);
        resetInspector();
        setInspectorContent(<InspectorContent key={selectedBoring.getId().getValue()} boring={selectedBoring} isNewCreated={false}/>)

        const boringName = selectedBoring.getName();
        setInspectorTitle(`${findValue('BoringEditor', 'editorHeaderEdit')} : ${boringName.length > 16 ? boringName.substring(0, 15)+'...' : boringName}`);
        setInspectorSize({width: 440, height: 600});

        registerInspectorClosingListner(unselectBoring);
        setInspectorVisiblity(true);
    }

    const onClickAddBoring = async () => {
        let boringName: string;
        if(namingMode == 'autoincrement') {
            if(!prefixRef.current.value || prefixRef.current.value.length == 0) {
                await window.electronSystemAPI.callDialogError('시추공 추가 오류', '접두어를 입력해 주세요');
                return;
            }
    
            if(!indexRef.current.value || parseInt(indexRef.current.value) == 0) {
                await window.electronSystemAPI.callDialogError('시추공 번호 오류', '시작번호를 1보다 큰 정수로 입력해 주세요');
                return;
            }
    
            // Seearch names
            const searchedNames = await searchBoringNamePattern(prefixRef.current.value, parseInt(indexRef.current.value));
            
            if(!searchedNames) {
                return;
            }

            if(searchedNames.length == 0) {
                boringName = `${prefixRef.current.value}-${indexRef.current.value}`;
            } else {
                const extractedNumbers = searchedNames.map(item => {
                    // Extract the number after the hyphen
                    const match = item.match(/-(\d+)$/);
                    return match ? parseInt(match[1], 10) : null;
                }).filter(num => num !== null);
                const targetIndex = Math.max(...extractedNumbers) + 1;
                boringName = `${prefixRef.current.value}-${targetIndex}`;
            }
        } else {
            const inputName = manualNameRef.current.value;
            const searchJob = await searchBoringName(inputName);
            
            if(searchJob == 'found') {
                await window.electronSystemAPI.callDialogError('시추공 중복 오류', '이미 사용중인 이름입니다.');
                return;
            }

            if(searchJob == 'internalError') {
                await window.electronSystemAPI.callDialogError('시스템 오류', '시스템 내부 오류.');
                return;
            }

            boringName = inputName;
        }

        const newBoring = new Boring(boringName, 0, 0, 0, 0);
        newBoring.addLayer(new Layer('레이어', 1));

        resetInspector();
        setInspectorContent(<InspectorContent key={newBoring.getId().getValue()} boring={newBoring} isNewCreated={true}/>);
        setInspectorTitle(`${findValue('BoringEditor', 'editorHeaderNew')} : ${newBoring.getName().length > 16 ? newBoring.getName().substring(0, 15)+'...' : newBoring.getName()}`);
        setInspectorSize({width: 440, height: 600});

        registerInspectorClosingListner(unselectBoring);
        setInspectorVisiblity(true);
    };

    const onClickRemoveBoring = async () => {
        const newSet = new Set(checkedItems);
        if(newSet.has(selectedBoringId)) {
            setInspectorVisiblity(false);
        }
        const targetBoringThreeIds: string[] = [];

        const result = await removeBoring(Array.from(newSet.values()));

        if(result) {
            setCheckedItems(new Set());
        }

        await fetchAllLayerColors();
    }

    const allowedCharactersOnPrefix = /^[a-zA-Z]*$/;
    
    const onChangePrefixHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (!allowedCharactersOnPrefix.test(value) && prefixRef.current) {
            prefixRef.current.value = value.slice(0, -1);
        }
    }

    const allowedCharactersOnManual = /^[a-zA-Z0-9-]*$/;
    const onChangeManualNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (!allowedCharactersOnManual.test(value) && manualNameRef.current) {
            manualNameRef.current.value = value.slice(0, -1);
        }
    }

    const onCheckedItemHandler = (id: string, checked: boolean, all?: boolean) => {
        if(all != null) {
            if(all) {
                const ids = new Set(borings.keys());
                ids.forEach(id => updateBoringDisplayItem(id, true));
                setCheckedItems(ids);
            } else {
                const ids = new Set(borings.keys());
                ids.forEach(id => updateBoringDisplayItem(id, false));
                setCheckedItems(new Set());
            }
        } else {
            const newSet = new Set(checkedItems);
            if(checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            setCheckedItems(newSet);
            updateBoringDisplayItem(id, checked);
        }
    }

    const onPickColor = async (index: number, targetId: string) => {
        updateLayerColor(targetId, index);
        setInspectorVisiblity(false);
    }

    const onClickLayerColor = (id: string, index: number) => {
        setInspectorContent(<ColorPicker targetId={id} onClickHandler={onPickColor}/>);
        setInspectorTitle(`색상 선택 : ${id}`)
        setInspectorSize({width: 244, height: 180});

        // Calculate bottom position
        setInspectorPosition(586, 340);
        setInspectorVisiblity(true);
    }

    const onChangeNamingMode =(e:ChangeEvent<HTMLInputElement>) => {
        if(e.target.value == 'manual') {
            setNamingMode('manual')
        } else if(e.target.value == 'autoincrement') {
            setNamingMode('autoincrement');
        }
    }

    // Swap X, Y Coord
    const onChangeXYCoord = () => {
        updateModalContent(<ModalSwapXY onSelectMode={swapXYCoord} />)
        toggleMode(true);
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const swapXYCoord = async (result: boolean) => {
        if (!result) return;
    
        const updatedBoringMap = new Map(borings);
        const updatedBorings: Boring[] = [];
        
        updatedBoringMap.forEach((boring, key) => {
            const coordX = boring.getLocationX();
            const coordY = boring.getLocationY();
    
            const clonedBoring = boring.clone();
            clonedBoring.setLocationX(coordY);
            clonedBoring.setLocationY(coordX);
    
            updatedBorings.push(clonedBoring);
        });
    
        for (const boring of updatedBorings) {
            await updateBoring(boring);
        }
    }

    useEffect(() => {
        fetchAllBorings();
        fetchAllLayerColors();

        return () => {
            setInspectorContent(null);
            setInspectorVisiblity(false);
            resetInspector();
        }
    }, []);
    
    

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-1" style={{userSelect:'none'}}>
                <div className="flex-grow">
                    {findValue('BoringManager', 'boringList')}
                </div>
            </div>
            <div>
                <ListBox 
                    height={340} 
                    items={boringDisplayItems}
                    onClickHandler={onClickHandler} 
                    onCheckedHandler={onCheckedItemHandler}
                    header={findValue('BoringManager', 'boringListBoxHeader')}/>
            </div>
            <div className="clas">
                <input 
                    type='radio'
                    name='input-naming-option'
                    className="self-start mr-1"
                    value='autoincrement'
                    defaultChecked={true} 
                    onChange={onChangeNamingMode}/>   
                <label>자동 넘버링</label>
            </div>
            <div className="flex flex-col">
                <div className="flex flex-row gap-1">
                    <div className="flex flex-row flex-grow">
                        <div className="w-[52px]">
                            접두어
                        </div>
                        <input 
                            className="h-full border-b w-[80px]"
                            onChange={onChangePrefixHandler}
                            ref={prefixRef}
                            placeholder="알파벳"
                            disabled={namingMode != 'autoincrement'}/>
                    </div>
                    <div className="flex flex-row gap-2 self-end">
                        <div className="">
                            시작번호
                        </div>
                        <input
                            type='number'
                            defaultValue={1}
                            className="border-b w-[44px]"
                            ref={indexRef}
                            min={1}
                            disabled={namingMode != 'autoincrement'}/>
                    </div>
                </div>
            </div>
            <div>
                <input 
                    type='radio'
                    name='input-naming-option'
                    className="self-start mr-1"
                    value='manual'
                    onChange={onChangeNamingMode}
                    />   
                <label>직접 입력</label>
            </div>
            <div className="flex flex-row items-center gap-2">
                <div className="w-[40px]">
                    이름
                </div>
                <input 
                    className="h-full border-b w-full"
                    ref={manualNameRef}
                    onChange={onChangeManualNameHandler}
                    placeholder="영문, 하이픈, 숫자 입력"
                    disabled={namingMode != 'manual'}/>
            </div>
            <div className="flex flex-row gap-2 self-end">
                <ButtonPositive text={"추가"} width={40} isEnabled={true} onClickHandler={onClickAddBoring}/>
                <ButtonNegative text={"삭제"} width={40} isEnabled={true} onClickHandler={onClickRemoveBoring}/>
            </div>
            <div className="flex flex-row flex-grow gap-1" ref={layerColorsRef}>
                <FoldableControl title={"색상"}>
                    <ListInputBox items={layerColorConfig.getAllLayerColors()} width={'full'} height={180} onClickHandler={onClickLayerColor} />
                </FoldableControl>
            </div>
            <div className="flex flex-row flex-grow">
                <FoldableControl title={"편집"}>
                    <div className="w-full gap-1">
                        <ButtonPositive text={"X, Y 좌표 바꾸기"} isEnabled={true} width={128} onClickHandler={onChangeXYCoord}/>
                    </div>
                </FoldableControl>
            </div>
        </div>
    )
}
