import * as THREE from 'three';
import { SceneController } from '../SceneController';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { ModelType } from '@/mainArea/models/modelType';
import { Circle, Cylinder, DXFLayer, DXFWriter, Line, Polyline, Text, Text3d, TextStyle, Triangle3d } from '../../dxfwriter/dxfwriter';
import { TopoDTO } from '@/dto/serviceModel/topoDto';
import { BoringDTO } from '@/dto/serviceModel/BoringDTO';
import { UnicodeConverter } from '../../dxfwriter/unicodeConverter';
import { Boring } from '@/mainArea/models/serviceModels/boring/boring';

interface MeshProp {
    createdFrom: TopoDTO,
    vertices: Map<number, {x: number, y: number, z: number}>,
    vertexNormals:  Map<number, {x: number, y: number, z: number}>,
    faces:  Map<number, {v1: number, v2: number, v3: number}>
}

const radius = 1;

export class ThreeExporter {
    private zAxisMode: 'camera'|'euclidean';

    constructor(zAxisMode:'camera'|'euclidean' = 'euclidean') {
        this.zAxisMode = zAxisMode;
    }
    
    downloadFile(fileName: string, content: string) {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    exportToposDXF(language: 'ENG'|'KOR'|'JPN', moveCoordinate?: {dx: number, dy: number}) {
        const [dx, dy] = moveCoordinate ? [moveCoordinate.dx, moveCoordinate.dy] : [0, 0];

        // Create DXFWriter
        const dxfWriter = new DXFWriter();
        
        // Get all mesh topos
        const scene = SceneController.getInstance().getScene();
        const targetObjects:THREE.Object3D[] = [];
        scene.traverse((obj) => {
            if (obj.userData['type'] === ModelType.Topo) {
                // Clone object and remove children to avoid exporting them
                const clonedObj = obj.clone();
                clonedObj.remove(...clonedObj.children);
                targetObjects.push(clonedObj);
            }
        });
    

        // Parse as mesh face datas
        const meshProps: MeshProp[] = targetObjects.map(obj => {
            const geometry = (obj as THREE.Mesh).geometry;
            const meshProp = {
                createdFrom: obj.userData['createdFrom'],
                vertices: new Map(),
                vertexNormals: new Map(),
                faces: new Map(),
            };

            // Extract vertices
            geometry.attributes.position.array.forEach((_, i) => {
                const x = geometry.attributes.position.getX(i);
                const y = geometry.attributes.position.getY(i);
                const z = geometry.attributes.position.getZ(i);
                if(this.zAxisMode == 'euclidean') {
                    meshProp.vertices.set(i + 1, { x: x+dx , y: y+dy, z: z });
                } else {
                    meshProp.vertices.set(i + 1, { x: x+dx, y: z, z: y+dy });
                }
            });

            // Extract vertex normals if they exist
            if (geometry.attributes.normal) {
                geometry.attributes.normal.array.forEach((_, i) => {
                    const x = geometry.attributes.normal.getX(i);
                    const y = geometry.attributes.normal.getY(i);
                    const z = geometry.attributes.normal.getZ(i);
                    if(this.zAxisMode == 'euclidean') {
                        meshProp.vertexNormals.set(i + 1, { x: x+dx, y: y+dy, z: z });
                    } else {
                        meshProp.vertexNormals.set(i + 1, { x: x+dx, y: z, z: y+dy });
                    }
                });
            }

            // Extract faces from index data
            if (geometry.index) {
                const index = geometry.index.array;
                for (let i = 0; i < index.length; i += 3) {
                    meshProp.faces.set((i / 3) + 1, {
                        v1: index[i] + 1,
                        v2: index[i + 1] + 1,
                        v3: index[i + 2] + 1,
                    });
                }
            }
            
            return meshProp;
        });

        // Create and register layers in the DXF file
        const layerMap:Map<string, DXFLayer> = new Map();
        meshProps.forEach((ly) => {
            const convertedLayerName = UnicodeConverter.convertStringToUnicode(ly.createdFrom.name);
            layerMap.set(ly.createdFrom.name, new DXFLayer(convertedLayerName, ly.createdFrom.colorIndex));
        });
        
        // DXF Writing
        // Register Layers
        layerMap.forEach((value) => {
            dxfWriter.registerLayer(value);
        });

        meshProps.forEach(prop => {
            const layer = layerMap.get(prop.createdFrom.name);
            prop.faces.forEach((value) => {
                const triangle3d = new Triangle3d({
                        v1: prop.vertices.get(value.v1),
                        v2: prop.vertices.get(value.v2),
                        v3: prop.vertices.get(value.v3),
                    }, 
                    layer
                );
                console.log(triangle3d);
                dxfWriter.addComponent(triangle3d);
            });
        })

        dxfWriter.exportAsDXFFile(language);
    }

    async exportBoringsDXF(language: 'ENG'|'KOR'|'JPN', moveCoordinate?: {dx: number, dy: number}) {
        const dxfWriter = new DXFWriter();

        const [dx, dy] = moveCoordinate ? [moveCoordinate.dx, moveCoordinate.dy] : [0, 0];
        
        // Load boring datas;
        const boringFetch = await window.electronBoringDataAPI.fetchAllBorings();
        const layerFetch = await window.electronBoringDataAPI.getAllLayerColors();
        if(!boringFetch || !boringFetch.result || !layerFetch || !layerFetch.result) {
            await window.electronSystemAPI.callDialogError('DXF 내보내기 오류', '내보내기 오류.');
            return;
        }

        // Register layers
        const layerMap: Map<string, DXFLayer> = new Map();
        layerFetch.layerColors.forEach((layerInfo, index) => {
            const convertedLayerName = UnicodeConverter.convertStringToUnicode(layerInfo[0]);
            layerMap.set(layerInfo[0], new DXFLayer(convertedLayerName, layerInfo[1]));
        });

        const textLayer = new DXFLayer('ANNOT', 250);
        layerMap.set(textLayer.name, textLayer);

        layerMap.forEach((layer) => {
            dxfWriter.registerLayer(layer);
        })

        // Register new text style
        const textNormalStyle = new TextStyle('TextNormal', 'malgun', 'malgun.ttf', 0.5);
        const textSmallStyle = new TextStyle('TextSmall', 'malgun', 'malgun.ttf', 0.5);
        dxfWriter.registerTextStyle(textNormalStyle);
        dxfWriter.registerTextStyle(textSmallStyle);
        const boringDatas = boringFetch.fetchedBorings.map(data => {
            data.location.x += dx;
            data.location.y += dy;

            return data;
        })

        const boringEnds = boringDatas.flatMap(boring => 
            boring.topoTop - boring.layers.flatMap(ly => ly.thickness).reduce((thickness, sum) => sum += thickness, 0)
        );

        const zMin = Math.min(...boringEnds);

        // Create boring shapes
        boringDatas.forEach(boring => {
            this.addBoringShape(boring, dxfWriter, layerMap, textLayer, textNormalStyle, textSmallStyle, zMin-2);
        });

        // Export as file
        dxfWriter.exportAsDXFFile(language);
    }

    private addBoringShape(boring: BoringDTO, dxfWriter: DXFWriter, postLayers: Map<string, DXFLayer>, textLayer: DXFLayer, layerTextStyle: TextStyle, sptTextStyle: TextStyle, zMin = 0) {
        let layerTop = boring.topoTop;
        const {x, y} = boring.location;

        // Register layer
        const boringLocationLayer = new DXFLayer("BoringLocation", 1);
        dxfWriter.registerLayer(boringLocationLayer);

        // Create boring center mark
        const centerCircle = new Circle(x, y, zMin, 1, boringLocationLayer);
        dxfWriter.addComponent(centerCircle);

        const centerLineVer = new Line(
            {x: x, y: y-1, z: zMin}, 
            {x: x, y: y+1, z: zMin},
            boringLocationLayer 
        );
        dxfWriter.addComponent(centerLineVer);

        const centerLineHor = new Line(
            {x: x-1, y: y, z: zMin}, 
            {x: x+1, y: y, z: zMin},
            boringLocationLayer 
        );
        dxfWriter.addComponent(centerLineHor);
        
        const boringText = new Text(boring.name, x+1, y+1, zMin, 1, boringLocationLayer, -1, "left", "baseline", layerTextStyle);
        dxfWriter.addComponent(boringText);

        // Post and layers
        boring.layers.forEach(layer => {
            // Create cylinder
            const postLayer = postLayers.get(layer.name);

            const borderCircle = new Circle(x, y, layerTop, radius, textLayer);
            dxfWriter.addComponent(borderCircle);

            const cylinder = new Cylinder({x: x, y: y, z: layerTop - layer.thickness}, radius, layer.thickness, 64, postLayer, -1);
            dxfWriter.addComponent(cylinder);

            // Create leader
            const line = new Line(
                {x: x+radius, y: y, z: layerTop},
                {x: x+radius+2, y: y, z: layerTop},
                textLayer,
            );
            dxfWriter.addComponent(line);

            // Create Text
            const convertedLayerName = UnicodeConverter.convertStringToUnicode(layer.name);
            const text = new Text3d(
                `${convertedLayerName} (${layerTop.toFixed(2)})`,
                'XZ',
                {x: x+radius+2.5, y: y, z: layerTop},
                0.5,
                textLayer,
                -1,
                "left",
                "middle",
                layerTextStyle
            );
            dxfWriter.addComponent(text);
            
            layerTop -= layer.thickness;
        });

        // Create boring name leader
        const boringNameLine = new Line(
            {x: x-radius,   y: y, z: boring.topoTop},
            {x: x-radius-8, y: y, z: boring.topoTop},
            textLayer,
        );
        dxfWriter.addComponent(boringNameLine);
        const boringNameText = new Text3d(
            boring.name,
            "XZ",
            {x: x-radius-8, y: y, z: boring.topoTop},
            1,
            textLayer,
            -1,
            "right",
            "middle",
            layerTextStyle
        );
        dxfWriter.addComponent(boringNameText);
        
        // Create boring end leader
        const line = new Line(
            {x: x+radius,   y: y, z: layerTop},
            {x: x+radius+8, y: y, z: layerTop},
            textLayer,
        );
        dxfWriter.addComponent(line);

        const convertedContent = UnicodeConverter.convertStringToUnicode(`시추종료 (${layerTop.toFixed(2)})`);
        const boringEndText = new Text3d(
            convertedContent,
            "XZ",
            {x: x+radius+8.5, y: y, z: layerTop},
            0.5,
            textLayer,
            -1,
            "left",
            "middle",
            layerTextStyle
        )
        dxfWriter.addComponent(boringEndText);

        // Create SPT Results
        const sptTop = boring.topoTop;
        boring.sptResults.forEach(spt => {
            // Create leader
            const line = new Line(
                {x: x-radius, y: y, z: sptTop-spt.depth},
                {x: x-radius-1, y: y, z: sptTop-spt.depth},
                textLayer,
            );
            dxfWriter.addComponent(line);

            // Create depth text
            const depthText = new Text3d(
                `${spt.depth}`,
                'XZ',
                {x: x-radius-6, y: y, z: sptTop-spt.depth},
                0.5,
                textLayer,
                -1,
                'right',
                'middle',
                sptTextStyle
            );
            dxfWriter.addComponent(depthText);

            // Create SPT result text
            const sptResultText = new Text3d(
                `${spt.hitCount} / ${spt.distance}`,
                'XZ',
                {x: x-radius-3, y: y, z: sptTop-spt.depth},
                0.5,
                textLayer,
                -1,
                'right',
                'middle',
                sptTextStyle
            );
            dxfWriter.addComponent(sptResultText);
        });

        //#region Create Underground Water
        const ungdWaterLevel = boring.topoTop - boring.undergroundWater
        if(!Number.isNaN(ungdWaterLevel)){
            const borderCircle = new Circle(x, y, ungdWaterLevel, radius, textLayer);
            dxfWriter.addComponent(borderCircle);

            const line = new Line(
                {x: x+radius,   y: y, z: ungdWaterLevel},
                {x: x+radius+8, y: y, z: ungdWaterLevel},
                textLayer,
            );
            dxfWriter.addComponent(line);
    
            const convertedContent = UnicodeConverter.convertStringToUnicode(`지하수위 : (${ungdWaterLevel.toFixed(2)})`);
            const ungdWaterLevelText = new Text3d(
                convertedContent,
                "XZ",
                {x: x+radius+8.5, y: y, z: ungdWaterLevel},
                0.5,
                textLayer,
                -1,
                "left",
                "middle",
                layerTextStyle
            )
            dxfWriter.addComponent(ungdWaterLevelText);
        }
        //#endregion
    }
}