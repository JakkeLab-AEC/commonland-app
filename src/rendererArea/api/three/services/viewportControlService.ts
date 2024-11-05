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
        // this.sceneController.controls.addEventListener('change', this.updateCameraPlane);
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
                        depthTest: false,

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
                depthTest: false,

                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });
        });

        this.sceneController.render();
    }

    updateLayerColor = (updateArgs:{layerName: string, colorIndex: number}[]) => {
        updateArgs.forEach(arg => {
            this.sceneController.getScene().traverse((obj) => {
                if(obj.userData['type'] == ModelType.PostSegment && obj.userData['layerName'] == arg.layerName) {
                    (obj as THREE.Mesh).material = new THREE.MeshPhongMaterial({
                        color: parseInt(colorPaletteValues[arg.colorIndex].slice(1), 16),
                        transparent: true,
                        opacity: useVisibilityOptionStore.getState().currentPostOpacity/100,
                        side: THREE.DoubleSide,
                        depthTest: false,

                        polygonOffset: true,
                        polygonOffsetFactor: 1,
                        polygonOffsetUnits: 1
                    });
                    
                }
            })
        });

        this.sceneController.render();
    }

    resetCamera = () => {
        // Remove the eventListener temporarily/
        this.sceneController.controls.removeEventListener('change', this.updateCameraPlane);

        const boundingBox = new THREE.Box3();
        const camera = this.sceneController.getCamera() as THREE.OrthographicCamera;

        // Calculate bounding box for the scene
        boundingBox.setFromObject(this.sceneController.getScene());

        const min = boundingBox.min;
        const max = boundingBox.max;

        // Calculate the direction vector from min to max
        const directionMinToMax = max.clone().sub(min).normalize();

        // Calculate positions
        const cameraCenter = max.clone().add(directionMinToMax.clone().multiplyScalar(10));
        const cameraLookAt = min;
        
        console.log(cameraCenter);
        
        // Set camera's coordinates
        camera.position.set(cameraCenter.x, cameraCenter.y, cameraCenter.z);
        camera.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z);

        camera.near = 0.1;
        camera.far = cameraCenter.distanceTo(cameraLookAt)+2000;
        camera.updateProjectionMatrix();

        // Apply change
        this.sceneController.setCamera(camera);
        this.sceneController.render();

        console.log(camera.position);

        // Restore the eventListener
        this.sceneController.controls.addEventListener('change', this.updateCameraPlane);
    }

    updateCameraPlane = () => {
        const boundingBox = new THREE.Box3();

         // Calculate bounding box for the scene
        boundingBox.setFromObject(this.sceneController.getScene());

        const min = boundingBox.min;
        const max = boundingBox.max;

        // Calculate the direction vector from min to max
        const directionMinToMax = max.clone().sub(min).normalize();

        // Load scene, camera, renderer
        const scene = this.sceneController.getScene();
        const camera = this.sceneController.getCamera() as THREE.OrthographicCamera;
        const renderer = this.sceneController.getRenderer();
        
        const cameraCenter = camera.position.clone(); // Keep the current camera position
        const cameraLookAt = max.clone().sub(directionMinToMax.clone().multiplyScalar(10));

        console.log(cameraCenter);

        camera.near = 0.1;
        camera.far = cameraCenter.distanceTo(cameraLookAt)+2000;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
        this.sceneController.setCamera(camera);
        console.log(camera.position);
    }
}