import { useEffect, useState } from "react"
import { ListBox } from "../../../../rendererArea/components/listbox/listBox"
import { useBoringBatcherStore } from "./boringBatcherStore";
import { ButtonPositive } from "../../../../rendererArea/components/buttons/buttonPositive";
import { ButtonNegative } from "../../../../rendererArea/components/buttons/buttonNegative";
import { FoldableControl } from "../../../../rendererArea/components/foldableControl/foldableControl";
import { ListInputBox } from "../../../../rendererArea/components/listbox/listInputBox";
import { useHomeStore } from "../../../../rendererArea/homeStatus/homeStatusModel";
import { ColorIndexPalette } from "../../../../rendererArea/components/palette/colorIndexPalette";
import { ThreeBoringPost } from "../../../../rendererArea/api/three/predefinedCreations/boringPost";
import { SceneController } from "../../../../rendererArea/api/three/SceneController";
import * as THREE from 'three';

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

export const BoringBatcher = () => {
    const [checkedBatchedItems, setCheckedBatchedItems] = useState<Set<string>>(new Set());
    const [checkedUnbatchedItems, setCheckedUnbatchedItems] = useState<Set<string>>(new Set());

    const {
        setInspectorSize,
        setInspectorPosition,
        setInspectorVisiblity,
        setInspectorContent,
        setInspectorTitle,
    } = useHomeStore();

    const {
        batchedBorings,
        unbatchedBorings,
        bacthedBoringDisplayItems,
        unbacthedBoringDisplayItems,
        layerColorConfig,
        batchBorings,
        unbatchBorings,
        fetchAllBorings,
        updateBatchedBoringDisplayItem,
        updateUnbatchedBoringDisplayItem,
        fetchAllLayerColors,
        updateLayerColor,
    } = useBoringBatcherStore();
    
    const onCheckedItemFromBatchedHandler = (id: string, checked: boolean, all?: boolean) => {
        if(all != null) {
            if(all) {
                const ids = new Set(batchedBorings.keys());
                ids.forEach(id => updateBatchedBoringDisplayItem(id, true));
                setCheckedBatchedItems(ids);
            } else {
                const ids = new Set(batchedBorings.keys());
                ids.forEach(id => updateBatchedBoringDisplayItem(id, false));
                setCheckedBatchedItems(new Set());
            }
        } else {
            const newSet = new Set(checkedBatchedItems);
            if(checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            setCheckedBatchedItems(newSet);
            updateBatchedBoringDisplayItem(id, checked);
        }
        console.log(checkedBatchedItems);
    }

    const onCheckedItemFromUnbatchedHandler = (id: string, checked: boolean, all?: boolean) => {
        if(all != null) {
            if(all) {
                const ids = new Set(unbatchedBorings.keys());
                ids.forEach(id => updateUnbatchedBoringDisplayItem(id, true));
                setCheckedUnbatchedItems(ids);
            } else {
                const ids = new Set(unbatchedBorings.keys());
                ids.forEach(id => updateUnbatchedBoringDisplayItem(id, false));
                setCheckedUnbatchedItems(new Set());
            }
        } else {
            const newSet = new Set(checkedUnbatchedItems);
            if(checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            setCheckedUnbatchedItems(newSet);
            updateUnbatchedBoringDisplayItem(id, checked);
        }
        console.log(checkedUnbatchedItems);
    }

    const unbatchBoringsWrapper = async () => {
        unbatchBorings(Array.from(checkedBatchedItems.values()));
        setCheckedBatchedItems(new Set());
    }

    const batchBoringsWrapper = async () => {
        batchBorings(Array.from(checkedUnbatchedItems.values()));
        setCheckedUnbatchedItems(new Set());
    }

    const onPickColor = async (index: number, targetId: string) => {
        updateLayerColor(targetId, index);
        setInspectorVisiblity(false);
    }

    const onClickLayerColor = (id: string, index: number) => {
        setInspectorContent(<ColorPicker targetId={id} onClickHandler={onPickColor}/>);
        setInspectorTitle(`색상 선택 : ${id}`)
        setInspectorSize({width: 244, height: 180});
        setInspectorPosition(672, 340);
        setInspectorVisiblity(true);
    }

    const onClickCreatePosts = async () => {
        const threeObjs: THREE.Object3D[] = [];
        for(const boring of batchedBorings.values()) {
            const objs = await ThreeBoringPost.createPostFromModel(boring, layerColorConfig);
            threeObjs.push(...objs);
        }

        SceneController.getInstance().addObjects(threeObjs);
    }

    useEffect(() => {
        fetchAllBorings();
        fetchAllLayerColors();

        return () => {
            setInspectorContent(null);
            setInspectorVisiblity(false);
        }
    }, []);

    return (
        <div className="flex flex-col gap-1">
            <div>
                배치된 시추공
            </div>
            <ListBox height={240} items={bacthedBoringDisplayItems} header={"이름"} onCheckedHandler={onCheckedItemFromBatchedHandler}/>
            <div className="flex flex-row place-content-between">
                <ButtonPositive text={"▲ 배치하기"} isEnabled={true} width={120} onClickHandler={batchBoringsWrapper}/>
                <ButtonNegative text={"▼ 보관하기"} isEnabled={true} width={120} onClickHandler={unbatchBoringsWrapper}/>
            </div>
            <div>
                보관된 시추공
            </div>
            <ListBox height={240} items={unbacthedBoringDisplayItems} header={"이름"} onCheckedHandler={onCheckedItemFromUnbatchedHandler}/>
            <div className="flex flex-row">
                <div className="flex-grow">
                    시추공 옵션
                </div>
                <ButtonPositive text={"생성"} isEnabled={true} width={48} onClickHandler={onClickCreatePosts}/>
            </div>
            <div className="flex flex-row flex-grow gap-1">
                <FoldableControl title={"색상"}>
                    <ListInputBox items={layerColorConfig.getAllLayerColors()} width={'full'} height={180} onClickHandler={onClickLayerColor} />
                </FoldableControl>
            </div>
            <hr/>
        </div>
    )
}
