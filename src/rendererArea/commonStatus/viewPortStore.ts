import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { create } from "zustand";
import { SceneController } from "../api/three/SceneController";
import { ThreeTopoSurface } from "../api/three/predefinedCreations/topoSurface";

interface ViewportStoreProp {
    renderTopos(topos: Topo[]),
}

export const useViewportStore = create<ViewportStoreProp>((set, get) => ({
    renderTopos: (topos: Topo[]) => {
        const sceneInstance = SceneController.getInstance();
        const meshes = topos.map(topo => ThreeTopoSurface.createTopoSurface(topo));
        sceneInstance.addObjects(meshes);
    },
}));