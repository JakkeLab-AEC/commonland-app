import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DefaultDimensions } from './defaultConfigs/DefaultDimensionConfigs';
import { ViewportControlService } from './services/viewportControlService';
import { ViewportDataManageService } from './services/dataManageService';

export class SceneController {

    /* Scene Props */
    private static defaultInstance : SceneController;
    private static registeredInstances: Map<string, SceneController> = new Map();
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.Renderer;
    controls: OrbitControls;
    public raycaster: THREE.Raycaster;
    public mouse: THREE.Vector2;
    
    /* Helpers */
    private gridHelper: THREE.GridHelper;

    /* Drawing Area */
    public drawingPlaneXZ: THREE.Plane;
    
    /* Services */
    private viewportControl: ViewportControlService;
    private dataManageService: ViewportDataManageService;

    public getViewportControl() {
        return this.viewportControl;
    }

    public getDataMangeService() {
        return this.dataManageService
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
        this.dataManageService = new ViewportDataManageService(this);
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
    
        // Add event listener to update near/far planes on control change
        sceneController.controls.addEventListener('change', sceneController.viewportControl.updateCameraPlane);
    
        // Initial render
        SceneController.defaultInstance = sceneController;
    }

    public addObject(object: THREE.Object3D): void {
        this.scene.add(object);
        this.render();
    }

    public addObjects(objects: THREE.Object3D[], onRendered?: () => void): void {
        if(!objects || objects.length === 0) return;
        
        if(onRendered) {
            const once = () => {
                onRendered();
            };

            this.scene.onAfterRender = () => {
                once();
                this.scene.onAfterRender = () => { }
            }
        }
        
        this.scene.add(...objects);
        this.render();
    }

    public removeObject(object: THREE.Object3D): void {
        this.scene.remove(object);
        this.render();
    }

    public removeObjectByUUIDs(ids: string[]): void {
        const targets = ids.map(id => {
            return this.scene.getObjectByProperty('uuid', id)
        });
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

    public setCamera(camera: THREE.Camera) {
        this.camera = camera;
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

    public addGridHelper() {
        const gridHelper = new THREE.GridHelper();
        gridHelper.rotation.x = Math.PI/2;
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
    
        const targetCamera = camera ? camera : new THREE.OrthographicCamera(
            -frustumSize * aspect / 2, frustumSize * aspect / 2,
            frustumSize / 2, -frustumSize / 2,
            -100000, 100000
        );

        targetCamera.up.set(0, 0, 1);
        
        targetCamera.position.set(50, 50, 50);
        targetCamera.zoom = 10;
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
        
        return {renderer: renderer, scene: targetScene, camera: targetCamera, control: controls}
    }
}