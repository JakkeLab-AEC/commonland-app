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

    async refreshBoringPosts() {
        const boringFetch = await window.electronBoringDataAPI.fetchAllBorings();
        const layerFetch = await window.electronBoringDataAPI.getAllLayerColors();
        if(boringFetch && boringFetch.result && layerFetch && layerFetch.result) {
            const threeObjects: THREE.Object3D[] = [];
            const threeOldObjUUIDs: string[] = [];
            const updatedDtos: BoringDTO[] = [];
            for (const dto of boringFetch.fetchedBorings) {
                const boring = Boring.deserialize(dto);
                const boringPost = new ThreeBoringPost();
                await boringPost.init();
                
                const layerConfig = new LayerColorConfig(layerFetch.layerColors);
                const threeObj = await boringPost.createPostFromModel(boring, layerConfig);
                threeOldObjUUIDs.push(dto.threeObjId);
                threeObjects.push(threeObj);

                boring.setThreeObjId(threeObj.uuid);
                updatedDtos.push(boring.serialize());
            }

            const updateJob = await window.electronBoringDataAPI.updateBorings(updatedDtos);
            if(updateJob && updateJob.result) {
                this.sceneController.removeObjectByUUIDs(threeOldObjUUIDs);
                this.sceneController.addObjects(threeObjects);
                this.sceneController.getViewportControl().resetCamera();
            }           
        }
    }
}