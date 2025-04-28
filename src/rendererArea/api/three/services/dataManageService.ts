import { BoringDTO } from "@/dto/serviceModel/BoringDTO";
import { SceneController } from "../SceneController";
import * as THREE from 'three';
import { Boring } from "@/mainArea/models/serviceModels/boring/boring";
import { ThreeBoringPost } from "../predefinedCreations/boringPost";
import { LayerColorConfig } from "@/mainArea/models/uimodels/layerColorConfig";
import { TopoType } from "@/mainArea/models/topoType";
import { createMeshFromTriangleSet } from "../predefinedCreations/triangleSetUtils";
import { createDelaunatedMesh } from "../predefinedCreations/delaunayUtils";
import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { createBoundaryObject } from "../predefinedCreations/siteBoundary";

export class ViewportDataManageService {
    constructor(sceneController: SceneController) {
        this.sceneController = sceneController;
    }

    private sceneController: SceneController;

    async refreshBoringPosts(callback?: () => void) {
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
            }
        }

        if(callback) callback();
    }

    async refreshTopos(callback?: () => void) {
        const threeOldObjUUIDs: string[] = [];
        
        const topoFetch = await window.electronTopoLayerAPI.fetchAllTopos();
        console.error(topoFetch);
        if(!topoFetch || !topoFetch.result) return;
        
        const meshes: THREE.Object3D[] = [];
        for(const topo of topoFetch.topoDatas) {
            if(topo.topoType === TopoType.DelaunayMesh) {
                const mesh = createDelaunatedMesh(Topo.deserialize(topo), topo.id);
                meshes.push(mesh);
            } else if (topo.topoType === TopoType.OrdinaryKriging) {
                const mesh = createMeshFromTriangleSet(topo.triangles, topo.colorIndex, {
                    topoType: topo.topoType,
                    name: topo.name,
                    threeObjId: topo.threeObjId,
                    colorIndex: topo.colorIndex,
                    isBatched: topo.isBatched,
                    id: topo.id,
                    modelType: topo.modelType
                });
                meshes.push(mesh);
            }

            threeOldObjUUIDs.push(topo.threeObjId);
        }

        this.sceneController.removeObjectByUUIDs(threeOldObjUUIDs);
        this.sceneController.addObjects(meshes);

        if(callback) callback();
    }

    async refreshBoundaries(callback?: () => void) {
        const threeOldObjUUIDs: string[] = [];

        const boundaryFetch = await window.electronTopoLayerAPI.selectBoundaryAll();
        if(!boundaryFetch || !boundaryFetch.result) return;

        const polylines: THREE.Object3D[] = [];
        for(const boundary of boundaryFetch.boundaries) {
            const polyline = createBoundaryObject(boundary);
            polylines.push(polyline);
            threeOldObjUUIDs.push(boundary.id);
        }

        this.sceneController.removeObjectByUUIDs(threeOldObjUUIDs);
        this.sceneController.addObjects(polylines);

        if(callback) callback();
    }

    async refreshAllGeometries(callback?: () => void) {
        await this.refreshBoringPosts();
        await this.refreshBoundaries();
        await this.refreshTopos();

        if(callback) callback();
    }
}