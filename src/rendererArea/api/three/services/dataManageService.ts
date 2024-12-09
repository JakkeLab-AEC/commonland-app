import { BoringDTO } from "@/dto/serviceModel/BoringDTO";
import { SceneController } from "../SceneController";
import * as THREE from 'three';
import { Boring } from "@/mainArea/models/serviceModels/boring/boring";
import { ThreeBoringPost } from "../predefinedCreations/boringPost";
import { LayerColorConfig } from "@/mainArea/models/uimodels/layerColorConfig";

export class ViewportDataManageService {
    constructor(sceneController: SceneController) {
        this.sceneController = sceneController;
    }

    private sceneController: SceneController;

    async refreshBoringPosts(loadingListner?: (value: number, message?: string) => void) {
        const boringFetch = await window.electronBoringDataAPI.fetchAllBorings();
        const layerFetch = await window.electronBoringDataAPI.getAllLayerColors();
        if(boringFetch && boringFetch.result && layerFetch && layerFetch.result) {
            const threeObjects: THREE.Object3D[] = [];
            const threeOldObjUUIDs: string[] = [];
            const updatedDtos: BoringDTO[] = [];
            
            // For loading timer
            let jobCount = 0;
            const totalJob = boringFetch.fetchedBorings.length - 1;
            for (const dto of boringFetch.fetchedBorings) {
                const boring = Boring.deserialize(dto);
                const boringPost = new ThreeBoringPost();
                await boringPost.init();
                
                if(loadingListner) {
                    loadingListner((jobCount/totalJob)*95);
                }

                const layerConfig = new LayerColorConfig(layerFetch.layerColors);
                const threeObj = await boringPost.createPostFromModel(boring, layerConfig);
                threeOldObjUUIDs.push(dto.threeObjId);
                threeObjects.push(threeObj);

                boring.setThreeObjId(threeObj.uuid);
                updatedDtos.push(boring.serialize());
                jobCount++;
            }

            const updateJob = await window.electronBoringDataAPI.updateBorings(updatedDtos);
            if(updateJob && updateJob.result) {
                this.sceneController.removeObjectByUUIDs(threeOldObjUUIDs);
                this.sceneController.addObjects(threeObjects);
                this.sceneController.getViewportControl().resetCamera();
            }

            if(loadingListner) {
                loadingListner(100)
            }
        }
    }
}