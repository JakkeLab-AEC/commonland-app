import { ChangeEvent } from "react"
import { FoldableControlHor } from "../components/foldableControl/foldableControlHor"
import { SceneController } from "../api/three/SceneController";
import { useVisibilityOptionStore } from "./visibilityOptionsStore";
import { ModelType } from "@/mainArea/models/modelType";

export const VisibilityOptions = () => {
    const {
        currentTopoOpacity,
        updateTopoOpacity
    } = useVisibilityOptionStore();

    const onChangePostOpacity = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    }

    const onChangeTopoOpacity = (e: ChangeEvent<HTMLInputElement>) => {
        SceneController.getInstance()
            .getViewportControl()
            .updateOpacityByModelType(ModelType.Topo, parseFloat(e.target.value)/100);
    }

    const onMouseUpOpacity = (e: React.MouseEvent<HTMLInputElement>) => {
        updateTopoOpacity(parseFloat(e.currentTarget.value));
    }

    const PostOpacitySlider = () => {
        return (
            <div className="flex flex-row gap-1">
                <div>
                    시추공 투명도
                </div>
                <input 
                    type='range'
                    className="w-[72px]"
                    onChange={onChangePostOpacity}/>
            </div>
        )
    }

    const TopoOpacitySlider = () => {
        return (
            <div className="flex flex-row gap-1">
                <div>
                    지형 투명도
                </div>
                <input 
                    type='range'
                    className="w-[72px]"
                    onChange={onChangeTopoOpacity}
                    onMouseUp={onMouseUpOpacity}
                    min='10'
                    max='100'
                    defaultValue={currentTopoOpacity}/>
            </div>
        )
    }

    return (
        <>
            <FoldableControlHor header={"표시 설정"} controls={[
                <PostOpacitySlider/>,
                <TopoOpacitySlider/>
            ]} />
        </>
    )
}
