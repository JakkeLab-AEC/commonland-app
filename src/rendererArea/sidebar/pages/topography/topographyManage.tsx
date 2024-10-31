import React, { useEffect, useState } from "react"
import { ButtonPositive } from "@/rendererArea/components/buttons/buttonPositive";
import { ButtonNegative } from "@/rendererArea/components/buttons/buttonNegative";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import { InspectorFixed } from "@/rendererArea/components/inspector/inspectorFixed";
import { InspectorTopoMaker } from './inspector/inspectorTopoMaker';
import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import {ListBoxColorPicker} from "@/rendererArea/components/listbox/listBoxColorPicker"
import { useTopoMakerStore } from "./inspector/inspectorTopoMakerStore";
import { useViewportStore } from "@/rendererArea/commonStatus/viewPortStore";
import { ThreeTopoSurface } from "@/rendererArea/api/three/predefinedCreations/topoSurface";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import { createDelaunatedMesh } from "@/rendererArea/api/three/geometricUtils/delaunayUtils";
import * as THREE from 'three';
import Delaunator from "delaunator";

export const TopographyManage = () => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    
    const {
        toggleMode,
        updateModalContent,
        resetProps
    } = useModalOveralyStore();

    const {
        insertTopo,
        fetchAllTopos,
        topoDisplayItems,
        fetchedTopos,
        updateDisplayItemCheck,
        updateDisplayItemColor,
        removeTopos
    } = useTopoMakerStore();

    const {
        renderTopos
    } = useViewportStore();

    const onSubmitTopo = async (topo: Topo) => {
        await insertTopo(topo);

        await fetchAllTopos();
    }

    const onClickCloseMaker = async () => {
        toggleMode(false);

        await fetchAllTopos();
    }

    const refreshTopoOnView = () => {
        const meshes = Array.from(fetchedTopos.values()).map(topo => {
            return createDelaunatedMesh(topo);
        })
        
        SceneController.getInstance().addObjects(meshes);
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
        updateDisplayItemColor(id, index);
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

        if(deleteJobResult) {
            setCheckedItems(new Set());
        }
    }

    useEffect(() => {
        fetchAllTopos();

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
                <ButtonPositive text={"새로 만들기"} isEnabled={true} width={84} onClickHandler={showEditor} />
                <ButtonNegative text={"삭제"} isEnabled={true} width={48} onClickHandler={onClickDeleteTopos}/>
            </div>
            <hr/>
            <div>
                <ButtonPositive text={"지형면 새로고침"} isEnabled={true} width={'100%'} onClickHandler={refreshTopoOnView}/>
            </div>
        </div>
    )
}
