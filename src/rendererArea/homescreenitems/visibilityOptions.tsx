import { ChangeEvent } from "react"
import { FoldableControlHor } from "../components/foldableControl/foldableControlHor"
import { SceneController } from "../api/three/SceneController";
import { useVisibilityOptionStore } from "./visibilityOptionsStore";
import { ModelType } from "@/mainArea/models/modelType";

export const VisibilityOptions = () => {
    const {
        currentTopoOpacity,
        currentPostOpacity,
        updateTopoOpacity,
        updatePostOpacity
    } = useVisibilityOptionStore();

    const onChangePostOpacity = (e: ChangeEvent<HTMLInputElement>) => {
        SceneController.getInstance()
            .getViewportControl()
            .updateOpacityByModelType(ModelType.PostSegment, parseFloat(e.target.value)/100);
    }

    const onChangeTopoOpacity = (e: ChangeEvent<HTMLInputElement>) => {
        SceneController.getInstance()
            .getViewportControl()
            .updateOpacityByModelType(ModelType.Topo, parseFloat(e.target.value)/100);
    }

    const onMouseUpTopoOpacity = (e: React.MouseEvent<HTMLInputElement>) => {
        updateTopoOpacity(parseFloat(e.currentTarget.value));
    }

    const onMouseUpPostOpacity = (e: React.MouseEvent<HTMLInputElement>) => {
        updatePostOpacity(parseFloat(e.currentTarget.value));
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
                    onChange={onChangePostOpacity}
                    onMouseUp={onMouseUpPostOpacity}
                    min='10'
                    max='100'
                    defaultValue={currentPostOpacity}/>
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
                    onMouseUp={onMouseUpTopoOpacity}
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
