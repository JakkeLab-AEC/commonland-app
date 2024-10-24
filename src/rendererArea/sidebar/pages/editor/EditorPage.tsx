import { useHomeStore } from "../../../../rendererArea/homeStatus/homeStatusModel";
import { ListBox } from "../../../../rendererArea/components/listbox/listBox"
import { ListBoxItem } from "../../../../rendererArea/components/listbox/listBoxItem"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { InspectorBoringEdit } from "./inspectors/inspectorBoringEdit";
import { useLanguageStore } from "../../../../rendererArea/language/languageStore";
import {ButtonPositive} from "../../../../rendererArea/components/buttons/buttonPositive";
import {ButtonNegative} from "../../../../rendererArea/components/buttons/buttonNegative";
import { useEditorPageStore } from "./EditorPageStore";
import { Boring } from "../../../../mainArea/models/serviceModels/boring/boring";
import { Layer } from "../../../../mainArea/models/serviceModels/boring/layer";

interface InspectorContent {
    boring: Boring
}

const InspectorContent:React.FC<InspectorContent> = ({boring}) => {
    return (<InspectorBoringEdit boring={boring.clone()}/>)
}

export const BoringManager = () => {
    const prefixRef = useRef<HTMLInputElement>(null);
    const manualNameRef = useRef<HTMLInputElement>(null);
    const indexRef = useRef<HTMLInputElement>(null);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [namingMode, setNamingMode] = useState<'manual'|'autoincrement'>('autoincrement');

    const {
        findValue,
    } = useLanguageStore();
    
    const {
        setInspectorVisiblity,
        setInspectorTitle,
        setInspectorContent,
        setInspectorSize,
        registerInspectorClosingListner
    } = useHomeStore();

    const {
        fetchAllBorings,
        insertBoring,
        selectBoring,
        searchBoringName,
        searchBoringNamePattern,
        removeBoring,
        unselectBoring,
        borings,
        boringDisplayItems,
        selectedBoringId,
        updateBoringDisplayItem
    } = useEditorPageStore();

    
    const onClickHandler = (id: string) => {
        const selectedBoring = selectBoring(id);
        setInspectorContent(<InspectorContent key={selectedBoring.getId().getValue()} boring={selectedBoring}/>)

        const boringName = selectedBoring.getName();
        setInspectorTitle(`${findValue('BoringEditor', 'editorHeader')} : ${boringName.length > 16 ? boringName.substring(0, 15)+'...' : boringName}`);
        setInspectorSize({width: 440, height: 600})

        registerInspectorClosingListner(unselectBoring)
        setInspectorVisiblity(true);
    }

    const onClickAddBoring = async () => {
        let boringName: string;
        if(namingMode == 'autoincrement') {
            if(!prefixRef.current.value || prefixRef.current.value.length == 0) {
                alert('접두어를 입력해 주세요');
                return;
            }
    
            if(!indexRef.current.value || parseInt(indexRef.current.value) == 0) {
                alert('시작번호를 1보다 큰 정수로 입력해 주세요');
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
                alert('이미 사용중인 이름입니다.');
                return;
            }

            if(searchJob == 'internalError') {
                alert('시스템 내부 오류.');
                return;
            }

            boringName = inputName;
        }

        const newBoring = new Boring(boringName, 0, 0, 0, 0);
        newBoring.addLayer(new Layer('레이어', 1));

        // Insert new boring
        await insertBoring(newBoring);
      
        // Fetch updated borings
        await fetchAllBorings();
    };

    const onClickRemoveBoring = async () => {
        const newSet = new Set(checkedItems);
        if(newSet.has(selectedBoringId)) {
            setInspectorVisiblity(false);
        }
        const result = await removeBoring(Array.from(newSet.values()));

        if(result) {
            setCheckedItems(new Set());
        }
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

    useEffect(() => {
        fetchAllBorings();

        return () => {
            setInspectorContent(null);
            setInspectorVisiblity(false);
        }
    }, []);
    
    const onChangeNamingMode =(e:ChangeEvent<HTMLInputElement>) => {
        if(e.target.value == 'manual') {
            setNamingMode('manual')
        } else if(e.target.value == 'autoincrement') {
            setNamingMode('autoincrement');
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-1" style={{userSelect:'none'}}>
                <div className="flex-grow">
                    {findValue('BoringManager', 'boringList')}
                </div>
            </div>
            <div>
                <ListBox 
                    height={420} 
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
                            className="h-full border-b w-[90px]"
                            onChange={onChangePrefixHandler}
                            ref={prefixRef}
                            placeholder="영문 알파벳"
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
                <div className="w-[32px]">
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
        </div>
    )
}
