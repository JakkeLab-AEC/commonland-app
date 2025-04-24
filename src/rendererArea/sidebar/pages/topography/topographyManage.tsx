import React, { useEffect, useRef, useState } from "react"
import { ButtonPositive } from "@/rendererArea/components/buttons/buttonPositive";
import { ButtonNegative } from "@/rendererArea/components/buttons/buttonNegative";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import { InspectorFixed } from "@/rendererArea/components/inspector/inspectorFixed";
import { InspectorTopoMaker } from './inspector/inspectorTopoMaker';
import {ListBoxColorPicker} from "@/rendererArea/components/listbox/listBoxColorPicker"
import { useTopoMakerStore } from "./inspector/inspectorTopoMakerStore";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import { TopoCreationOptions } from "./options";

export const TopographyManage = () => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const boundaryNameRef = useRef<HTMLInputElement>(null);

    const {
        toggleMode,
        updateModalContent,
        resetProps
    } = useModalOveralyStore();

    const {
        topoDisplayItems,
        fetchedTopos,
        boundaryDisplayItems,
        updateDisplayItemCheck,
        updateDisplayItemColor,
        removeTopos,
        insertTopo,
        fetchAllTopos,
        fetchAllBoundaries,
        insertBoundary
    } = useTopoMakerStore();

    const onSubmitTopo = async (options: TopoCreationOptions) => {
        await insertTopo(options);
        
        await fetchAllTopos();
    }

    const onClickCloseMaker = async () => {
        toggleMode(false);

        await fetchAllTopos();
    }

    const onCheckedHandler = async (id: string, checked: boolean, all?: boolean | null) => {
        if(all != null) {
            if(all) {
                const ids = new Set(fetchedTopos.keys());
                ids.forEach(id => updateDisplayItemCheck(id, true));
                setCheckedItems(ids);
            } else {
                const ids = new Set(fetchedTopos.keys());
                ids.forEach(id => updateDisplayItemCheck(id, false));
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
            updateDisplayItemCheck(id, checked);
        }
    }

    const onChangeUpdateColor = async (id: string, index: number) => {
        const updateJob = await updateDisplayItemColor(id, index);
        if(updateJob && updateJob.result) {
            const updatedTopo = updateJob.updatedTopo;

            SceneController.getInstance()
                .getViewportControl()
                .updateTopoColor([{
                    threeObjId: updatedTopo.getThreeObjId(),
                    colorIndex: index,
            }]);
        }
    }

    const TopographyEditor:React.FC<{}> = () => {
        return (
        <InspectorFixed title={"지형 생성"} width={1280} height={720} onClickCloseHandler={onClickCloseMaker}>
            <InspectorTopoMaker onSubmitTopo={onSubmitTopo} onClickClose={onClickCloseMaker}/>
        </InspectorFixed>
        )
    }

    const showEditor = () => {
        updateModalContent(<TopographyEditor/>);
        toggleMode(true);
    }

    const onClickDeleteTopos = async () => {
        const newSet = new Set(checkedItems);
        const deleteJobResult = await removeTopos(Array.from(newSet.values()));

        if(deleteJobResult.result) {
            setCheckedItems(new Set());
            const targetThreeIds = deleteJobResult.deletedTopos.map(topo => topo.getThreeObjId());
            SceneController.getInstance().removeObjectByUUIDs(targetThreeIds);
        }
    }

    const addBoundary = async () => {
        const name = boundaryNameRef.current.value;
        if(!name || name.length === 0) {
            await window.electronSystemAPI.callDialogError("경계선 추가 오류", "이름을 입력 후 실행해 주세요.");
            boundaryNameRef.current.focus();
            return;
        }
        
        insertBoundary(name);
    }

    const removeBoundary = () => {
        
    }

    useEffect(() => {
        fetchAllTopos();
        fetchAllBoundaries();
        
        return () => {
            resetProps();
        }
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex">
                지형 목록
            </div>
            <div className="flex-grow">
                <ListBoxColorPicker 
                    height={240} 
                    items={topoDisplayItems} 
                    header={"이름"} 
                    onChangeColorHandler={onChangeUpdateColor} 
                    onCheckedHandler={onCheckedHandler}/>
            </div>
            <div className="flex flex-row place-content-between">
                <ButtonPositive text={"새로 만들기"} isEnabled={true} width={92} onClickHandler={showEditor} />
                <ButtonNegative text={"삭제"} isEnabled={true} width={48} onClickHandler={removeBoundary}/>
            </div>
            <hr/>
            <div>
                <span>대지경계선 리스트</span>
            </div>
            <div>
                <ListBoxColorPicker 
                    height={240} 
                    items={boundaryDisplayItems} 
                    header={"폴리라인"}/>
            </div>
            <div className="flex flex-row place-content-between gap-2">
                <input className="border rounded-md w-full" maxLength={22} ref={boundaryNameRef}/>
                <ButtonPositive text={"추가"} isEnabled={true} width={60} onClickHandler={addBoundary} />
                <ButtonNegative text={"삭제"} isEnabled={true} width={60} onClickHandler={removeBoundary}/>
            </div>
        </div>
    )
}
