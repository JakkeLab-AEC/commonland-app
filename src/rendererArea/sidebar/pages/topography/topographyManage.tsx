import React, { useEffect } from "react"
import { ListBox } from '@/rendererArea/components/listbox/listBox';
import { ButtonPositive } from "@/rendererArea/components/buttons/buttonPositive";
import { ButtonNegative } from "@/rendererArea/components/buttons/buttonNegative";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import { InspectorFixed } from "@/rendererArea/components/inspector/inspectorFixed";
import { useHomeStore } from "@/rendererArea/homeStatus/homeStatusModel";
import {InspectorTopographyManager} from './inspector/inspectorTopograpyManage';

const sampleTopos = new Map<string, {displayString: string, checked: boolean}>([
    ["id1", {displayString: "Test", checked: false}],
    ["id2", {displayString: "Test", checked: false}],
    ["id3", {displayString: "Test", checked: false}],
]);



export const TopographyManage = () => {
    const {
        toggleMode,
        updateModalContent
    } = useModalOveralyStore();

    const {
        
    } = useHomeStore();

    const TopographyEditor:React.FC<{}> = () => {
        return (
        <InspectorFixed title={"지형 생성"} width={1280} height={720} onClickCloseHandler={() => toggleMode(false)}>
            <InspectorTopographyManager />
        </InspectorFixed>
        )
    }

    const showEditor = () => {
        updateModalContent(<TopographyEditor/>);
        toggleMode(true);
    }

    useEffect(() => {
        // showEditor()
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex">
                지형 목록
            </div>
            <div className="flex-grow">
                <ListBox height={240} items={sampleTopos} header={"이름"} />
            </div>
            <div className="flex flex-row place-content-between">
                <ButtonPositive text={"새로 만들기"} isEnabled={true} width={84} onClickHandler={showEditor} />
                <ButtonNegative text={"삭제"} isEnabled={true} width={48} />
            </div>
            <hr/>
            <div>
                지형
            </div>
        </div>
    )
}
