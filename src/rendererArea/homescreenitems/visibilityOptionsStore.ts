import { ModelType } from "@/mainArea/models/modelType"
import { SceneController } from "../api/three/SceneController"
import { create } from "zustand";

interface VisibilityOptionProps {
    currentTopoOpacity: number;
    currentPostOpacity: number;
    updateTopoOpacity: (opacity: number) => void;
    updatePostOpacity: (opacity: number) => void;
}

export const useVisibilityOptionStore = create<VisibilityOptionProps>((set, get) => ({
    currentTopoOpacity: 50,
    currentPostOpacity: 50,
    updateTopoOpacity: (opacity: number) => {
        SceneController.getInstance().getViewportControl().updateOpacityByModelType(ModelType.Topo, opacity/100);
        set(() => {
            return { currentTopoOpacity : opacity }
        });
    },
    updatePostOpacity: (opacity: number) => {
        SceneController.getInstance().getViewportControl().updateOpacityByModelType(ModelType.PostSegment, opacity/100);
        set(() => {
            return { currentPostOpacity : opacity }
        })
    }
}));