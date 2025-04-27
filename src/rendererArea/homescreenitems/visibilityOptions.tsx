import { ChangeEvent, useEffect, useState } from "react"
import { FoldableControlHor } from "../components/forms/foldableControl/foldableControlHor"
import { SceneController } from "../api/three/SceneController";
import { useVisibilityOptionStore } from "./visibilityOptionsStore";
import { ModelType } from "@/mainArea/models/modelType";
import { ButtonPositive } from "../components/forms/buttons/buttonPositive";
import { useSidebarStore } from '../sidebar/sidebarStore';
import { useModalOveralyStore } from "./modalOverlayStore";
import { ModalLoading } from "../components/forms/loadings/modalLoading";

export const VisibilityOptions = () => {
    const [isResetBoringEnabled, setRestBoringState] = useState<boolean>(false);
    const {
        currentTopoOpacity,
        currentPostOpacity,
        updateTopoOpacity,
        updatePostOpacity
    } = useVisibilityOptionStore();
    
    const {
        navigationIndex
    } = useSidebarStore();

    const {
        toggleMode,
        updateModalContent
    } = useModalOveralyStore();

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
                    max='90'
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
                    max='90'
                    defaultValue={currentTopoOpacity}/>
            </div>
        )
    }

    const onClickResetCamera = () => {
        SceneController.getInstance().getViewportControl().resetCamera();
    }

    const onClickResetBorings = async () => {
        updateModalContent(<ModalLoading />)
        toggleMode(true);

        const onRefreshEnd = () => {
            SceneController.getInstance().getViewportControl().resetCamera();
            toggleMode(false);
        }

        if(navigationIndex != 1) {
            await SceneController.getInstance().getDataMangeService().refreshAllGeometries(onRefreshEnd);
        }
    }

    useEffect(() => {
        if(navigationIndex === 1) {
            setRestBoringState(false);
        } else {
            setRestBoringState(true);
        }
    }, [navigationIndex])

    return (
            <FoldableControlHor header={"표시 설정"} controls={[
                <PostOpacitySlider/>,
                <TopoOpacitySlider/>,
                <ButtonPositive text={"전체 보기"} isEnabled={true} onClickHandler={onClickResetCamera} width={80}/>,
                <ButtonPositive text={"뷰포트 새로고침"} isEnabled={isResetBoringEnabled} onClickHandler={onClickResetBorings} width={132}/>
            ]} />
    )
}
