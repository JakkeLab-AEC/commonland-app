import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DefaultDimensions } from './defaultConfigs/DefaultDimensionConfigs';
import { ViewportControlService } from './services/viewportControlService';

export class SceneController {

    /* Scene Props */
    private static defaultInstance : SceneController;
    private static registeredInstances: Map<string, SceneController> = new Map();
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.Renderer;
    private controls: OrbitControls;
    public raycaster: THREE.Raycaster;
    public mouse: THREE.Vector2;
    
    /* Helpers */
    private gridHelper: THREE.GridHelper;

    /* Drawing Area */
    public drawingPlaneXZ: THREE.Plane;
    
    /* Services */
    private viewportControl: ViewportControlService;

    public getViewportControl() {
        return this.viewportControl;
    }

    /* Default Configs */
    
    private constructor(config: { renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, control: OrbitControls }) {
        this.renderer = config.renderer;
        this.scene = config.scene;
        this.camera = config.camera;
        this.controls = config.control;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.controls.update();
        this.drawingPlaneXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.viewportControl = new ViewportControlService(this);
    }

    public static getInstance(): SceneController {
        if (!SceneController.defaultInstance) {
            throw new Error("SceneController is not initialized. Call setInstance first.");
        }
        return SceneController.defaultInstance;
    }

    public static setInstance(config: { renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, control: OrbitControls }): void {
        const sceneController = new SceneController(config);
        sceneController.addGridHelper();
        SceneController.defaultInstance = sceneController;
    }

    public addObject(object: THREE.Object3D): void {
        this.scene.add(object);
        this.render();
    }

    public addObjects(objects: THREE.Object3D[]): void {
        this.scene.add(...objects);
        this.render();
    }

    public removeObject(object: THREE.Object3D): void {
        this.scene.remove(object);
        this.render();
    }

    public removeObjectByUUIDs(ids: string[]): void {
        console.log(ids);
        const targets = ids.map(id => this.scene.getObjectByProperty('uuid', id));
        console.log(targets);
        this.scene.remove(...targets);
        this.render();
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public animate(): void {
        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    public getCamera(): THREE.Camera {
        return this.camera;
    }

    public getRenderer(): THREE.Renderer {
        return this.renderer;
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public static registerInstance(id: string, config: { renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, control: OrbitControls }): SceneController {
        const sceneController = new SceneController(config);
        sceneController.addGridHelper();
        SceneController.registeredInstances.set(id, sceneController);
        return sceneController;
    }

    public static unregisterInstance(id: string): void {
        SceneController.registeredInstances.delete(id);
    }

    public static getRegisteredInstance(id: string): SceneController {
        return SceneController.registeredInstances.get(id);
    }

    // public static serializeCamera(currentCamera: THREE.Camera): ThreeViewJSON | undefined {
    //     const cameraCommonProps = {
    //         id: uuidv4(),
    //         viewName: "New View",
    //         viewType: currentCamera.type,
    //         cameraPosition: {
    //             x: currentCamera.position.x,
    //             y: currentCamera.position.y,
    //             z: currentCamera.position.z,
    //         },
    //         cameraRotation: {
    //             x: currentCamera.quaternion.x,
    //             y: currentCamera.quaternion.y,
    //             z: currentCamera.quaternion.z,
    //             w: currentCamera.quaternion.w,
    //         },
    //         up: {
    //             x: currentCamera.up.x,
    //             y: currentCamera.up.y,
    //             z: currentCamera.up.z,
    //         },
    //     };
    
    //     if (currentCamera.type === 'PerspectiveCamera') {
    //         const camera = currentCamera as THREE.PerspectiveCamera;
    //         const cameraProps = {
    //             fov: camera.fov,
    //             near: camera.near,
    //             far: camera.far,
    //         };
    //         return {
    //             ...cameraCommonProps,
    //             viewType: 'PerspectiveCamera',
    //             PerspectiveViewProps: cameraProps,
    //         } as ThreePerspectiveViewJSON;
    //     } else if (currentCamera.type === 'OrthographicCamera') {
    //         const camera = currentCamera as THREE.OrthographicCamera;
    //         const cameraProps = {
    //             zoom: camera.zoom,
    //             left: camera.left,
    //             right: camera.right,
    //             top: camera.top,
    //             bottom: camera.bottom,
    //         };
    //         return {
    //             ...cameraCommonProps,
    //             viewType: 'OrthographicCamera',
    //             OrthographicViewProps: cameraProps,
    //         } as ThreeOrthographicViewJSON;
    //     } else {
    //         return undefined;
    //     }
    // }

    /**
     * Set size of Viewport.
     * The type of camera has two values : PerspectiveCamera, OrthographicCamera
     * @param width Viewport's Width (Canvas)
     * @param height Viewport's Height (Canvas)
     */
    public resize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        const currentCameraType = this.camera.type;
        if(currentCameraType == 'PerspectiveCamera') {
            const perspectiveCamera = this.camera as THREE.PerspectiveCamera;
            perspectiveCamera.aspect = width / height;
            perspectiveCamera.updateProjectionMatrix();
        } else if (currentCameraType == 'OrthographicCamera') {
            const orthographicCamera = this.camera as THREE.OrthographicCamera;
            const aspect = width / height;
            const frustumSize = height;

            orthographicCamera.left = -frustumSize * aspect / 2;
            orthographicCamera.right = frustumSize * aspect / 2;
            orthographicCamera.top = frustumSize / 2;
            orthographicCamera.bottom = -frustumSize / 2;
            orthographicCamera.updateProjectionMatrix();
        } else {
            return;
        }

        this.render();
    }

    // public updateCameraFromView(view: ThreeView): void {
    //     if (view instanceof ThreePerspectiveView) {
    //         const camera = this.camera as THREE.PerspectiveCamera;
    //         camera.position.set(view.cameraPosition.x, view.cameraPosition.y, view.cameraPosition.z);
    //         camera.quaternion.set(view.cameraRotation.x, view.cameraRotation.y, view.cameraRotation.z, view.cameraRotation.w);
    //         camera.fov = view.fov;
    //         camera.near = view.near;
    //         camera.far = view.far;
    //         camera.updateProjectionMatrix();
    //     } else if (view instanceof ThreeOrthographicView) {
    //         const camera = this.camera as THREE.OrthographicCamera;
    //         camera.position.set(view.cameraPosition.x, view.cameraPosition.y, view.cameraPosition.z);
    //         camera.setRotationFromQuaternion(new THREE.Quaternion(view.cameraRotation.x, view.cameraRotation.y, view.cameraRotation.z, view.cameraRotation.w));
    //         camera.zoom = view.zoom;
    //         camera.left = view.left;
    //         camera.right = view.right;
    //         camera.top = view.top;
    //         camera.bottom = view.bottom;
    //         camera.updateProjectionMatrix();
    //     }

    //     this.controls.update();
    //     this.render();
    // }

    
    // public setTopView(): void {
    //     const boundingBox = this.getBoundingBoxOfObjects();
    //     const boundingCenter = new THREE.Vector3();
    //     boundingBox.getCenter(boundingCenter);
    
    //     if (this.camera.type === 'PerspectiveCamera') {
    //         const perspectiveCamera = this.camera as THREE.PerspectiveCamera;
    //         const cameraY = boundingBox.max.y + 10; // Adding some offset for better visibility
    //         perspectiveCamera.position.set(boundingCenter.x, cameraY, boundingCenter.z);
    //         perspectiveCamera.lookAt(boundingCenter.x, boundingCenter.y, boundingCenter.z);
    //     } else if (this.camera.type === 'OrthographicCamera') {
    //         const orthographicCamera = this.camera as THREE.OrthographicCamera;
    //         const canvasWidth = this.renderer.domElement.clientWidth;
    //         const canvasHeight = this.renderer.domElement.clientHeight;
    //         const aspect = canvasWidth / canvasHeight;
    //         const frustumSize = 100; // Adjust frustum size as needed

    //         orthographicCamera.left = -frustumSize * aspect / 2;
    //         orthographicCamera.right = frustumSize * aspect / 2;
    //         orthographicCamera.top = frustumSize / 2;
    //         orthographicCamera.bottom = -frustumSize / 2;

    //         orthographicCamera.quaternion.set(0, 0, 0, 0);
    //         orthographicCamera.position.set(0, 100, 0); // Adding offset for visibility
            
    //         orthographicCamera.lookAt(0, 0, 0);
    //         orthographicCamera.near = 0.1;
    //         orthographicCamera.far = 1000;
    //         orthographicCamera.zoom = 1; // Adjust zoom as needed
    //         orthographicCamera.updateProjectionMatrix();

    //         console.log(orthographicCamera);

    //         // Update the camera instance in SceneController
    //         this.camera = orthographicCamera;
    //         this.controls.object = orthographicCamera;
    //         this.controls.update();
    //     }
    
    //     // Ensure the controls are updated
    //     this.controls.update();
    //     this.render();
    // }

    public addGridHelper() {
        const gridHelper = new THREE.GridHelper();
        this.gridHelper = gridHelper;
        this.scene.add(gridHelper);
        this.render();
    }

    public removeGridHelper() {
        this.scene.remove(this.gridHelper);
        this.render();
    }

    /**
     * Calculate the bounding box that contains all objects in the scene.
     * @returns The bounding box containing all objects.
     */
    public getBoundingBoxOfObjects():THREE.Box3 {
        const boundingBox = new THREE.Box3();
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const objectBoundingBox = new THREE.Box3().setFromObject(object);
                boundingBox.union(objectBoundingBox);
            }
        });
        return boundingBox;
    }
    
    //#region Event Handlers
    /**
     * Test method for checking raycast.
     * @param position 
     */
    private TaddCylinder(position: THREE.Vector3): void {
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
        const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.copy(position);
        this.addObject(cylinder);
    }

    //#endregion
    static CreateRenderer(canvas: HTMLCanvasElement): THREE.Renderer {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
    
        renderer.setSize( canvas.width, canvas.height );
        return renderer;
    }

    static InitiateRenderer(renderer: THREE.Renderer, scene?: THREE.Scene, camera?: THREE.PerspectiveCamera) {
        const canvasWidth = renderer.domElement.clientWidth;
        const canvasHeight = renderer.domElement.clientHeight;
        const targetScene = scene ? scene : new THREE.Scene();
        
        const aspect = canvasWidth / canvasHeight;
        const frustumSize = canvasHeight;
    
        // const targetCamera = camera ? camera : new THREE.OrthographicCamera(
        //     -frustumSize * aspect / 2, frustumSize * aspect / 2,
        //     frustumSize / 2, -frustumSize / 2,
        //     -1000, 1000
        // );
    
        const targetCamera = camera ? camera : new THREE.OrthographicCamera(
            -frustumSize * aspect / 2, frustumSize * aspect / 2,
            frustumSize / 2, -frustumSize / 2,
            0.1, 10000
        );
        
        targetCamera.position.set(50, 50, 50);
        targetCamera.zoom = 100;
        targetCamera.updateProjectionMatrix();
        targetCamera.lookAt(new THREE.Vector3(0, 0, 0));
        targetScene.add(new THREE.AxesHelper());
    
        //Default Control and camera
        const controls = new OrbitControls(targetCamera, renderer.domElement);
        controls.mouseButtons = {
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE,
        }
    
        targetScene.background = new THREE.Color(0.9, 0.9, 0.9);
        
        //Default Light
        const ambientLight = new THREE.AmbientLight('white');
        targetScene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight('white', 1);
        directionalLight.position.set(5, 10, 7.5);
        targetScene.add(directionalLight);

        // Default dim sets
        // DefaultDimensions.initiate();
    
        //Render
        function initiateRender() {
            renderer.render(targetScene, targetCamera);
        }
    
        controls.addEventListener('change', initiateRender);
    
        initiateRender();
        return {renderer: renderer, scene: targetScene, camera: targetCamera, control: controls}
    }
}