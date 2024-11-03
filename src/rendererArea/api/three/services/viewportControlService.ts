import * as THREE from 'three';
import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { SceneController } from "../SceneController";
import { createDelaunatedMesh } from '../geometricUtils/delaunayUtils';
import { colorPaletteValues } from '@/public/colorPalette';
import { ModelType } from '@/mainArea/models/modelType';
import { useVisibilityOptionStore } from '@/rendererArea/homescreenitems/visibilityOptionsStore';

export class ViewportControlService {
    constructor(sceneController: SceneController) {
        this.sceneController = sceneController;
    }

    private sceneController: SceneController;

    renderTopos = async (topos: Topo[]) => {
        const meshes: THREE.Object3D[] = []
        const ids: {id: string, threeObjId: string}[] = [];

        topos.forEach((topo) => {
            const mesh = createDelaunatedMesh(topo);
            meshes.push(mesh);
            ids.push({id: topo.elementId.getValue(), threeObjId: mesh.uuid});
        });

        const updateJob = await window.electronTopoLayerAPI.updateTopoThreeObjId(ids);
        if(updateJob.result) {
            this.sceneController.addObjects(meshes);
        }
    }

    updateTopoColor = (updateArgs: {threeObjId: string, colorIndex: number}[]) => {
        try {
            console.log(updateArgs);
            updateArgs.forEach(arg => {
                const threeObj = this.sceneController.getScene().getObjectByProperty('uuid', arg.threeObjId);
                if(threeObj) {
                    (threeObj as THREE.Mesh).material = new THREE.MeshPhongMaterial({
                        color: parseInt(colorPaletteValues[arg.colorIndex].slice(1), 16),
                        transparent: true,
                        opacity: useVisibilityOptionStore.getState().currentTopoOpacity/100,
                        side: THREE.DoubleSide,

                        polygonOffset: true,
                        polygonOffsetFactor: 1,
                        polygonOffsetUnits: 1
                    });
                }
            });
            this.sceneController.render();
        } catch (error) {
            console.log(error);
        }
    }

    updateOpacityByModelType = (modelType: ModelType, opacity: number)=> {
        const matchingObjects: THREE.Object3D[] = [];
        this.sceneController.getScene().traverse((obj) => {
            if(obj.userData['type'] == modelType) {
                matchingObjects.push(obj);
            }
        });

        matchingObjects.forEach(obj => {
            const originalMat = (obj as THREE.Mesh).material as THREE.MeshPhongMaterial;
            (obj as THREE.Mesh).material = new THREE.MeshPhongMaterial({
                color: originalMat.color,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide,

                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });
        });

        this.sceneController.render();
    }
}