import * as THREE from 'three';
import { LayerColorConfig } from "@/mainArea/models/uimodels/layerColorConfig";
import { ThreeBoringPost } from "../predefinedCreations/boringPost";
import { Boring } from "@/mainArea/models/serviceModels/boring/boring";
import { SceneController } from '../SceneController';


async function refreshViewPort(layerColorConfig: LayerColorConfig, onRendered?: () => void): Promise<void> {
    const fetchJob = await window.electronBoringDataAPI.fetchAllBorings();
    if(!fetchJob || !fetchJob.result || fetchJob.fetchedBorings.length === 0) return;

    const boringCreator = new ThreeBoringPost();
    await boringCreator.init();
    
    const boringObjects: THREE.Object3D[] = [];
    for(const dto of fetchJob.fetchedBorings) {
        const boring = Boring.deserialize(dto);
        const createdBoringObject = await boringCreator.createPostFromModel(boring, layerColorConfig);
        boringObjects.push(createdBoringObject);
    }

    SceneController.getInstance().addObjects(boringObjects, onRendered);
}

export const ViewportUtils = {
    refreshViewPort
}