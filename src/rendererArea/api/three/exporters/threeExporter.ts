import * as THREE from 'three';
import { SceneController } from '../SceneController';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { ModelType } from '@/mainArea/models/modelType';
import { Circle, Cylinder, DXFLayer, DXFWriter, Line, Polyline, Text, Text3d, TextStyle, Triangle3d } from '../../dxfwriter/dxfwriter';
import { TopoDTO } from '@/dto/serviceModel/topoDto';
import { BoringDTO } from '@/dto/serviceModel/BoringDTO';
import { UnicodeConverter } from '../../dxfwriter/unicodeConverter';

interface MeshProp {
    createdFrom: TopoDTO,
    vertices: Map<number, {x: number, y: number, z: number}>,
    vertexNormals:  Map<number, {x: number, y: number, z: number}>,
    faces:  Map<number, {v1: number, v2: number, v3: number}>
}

const radius = 1;

export class ThreeExporter {
    static downloadFile(fileName: string, content: string) {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    static exportToposDXF() {
        // Create DXFWriter
        const dxfWriter = new DXFWriter();
        
        // Get all mesh topos
        const scene = SceneController.getInstance().getScene();
        const targetObjects:THREE.Object3D[] = [];
        scene.traverse((obj) => {
            if(obj.userData['type'] == ModelType.Topo) {
                // Remove children (LineSegments)
                const clonedObj = obj.clone();
                clonedObj.remove(...clonedObj.children)
                targetObjects.push(clonedObj);
            }
        });

        // Parse as mesh face datas
        const exporter = new OBJExporter();
        const meshProps: MeshProp[] = []
        
        targetObjects.forEach(obj => {
            const data = exporter.parse(obj);
            const lines = data.split('\n');
            
            let vIndex = 1;
            let vnIndex = 1;
            let fIndex = 1;
            const newMeshProp: MeshProp = {
                createdFrom: obj.userData['createdFrom'],
                vertices: new Map(),
                vertexNormals: new Map(),
                faces: new Map()
            };

            lines.forEach(line => {
                if(line.length != 0) {
                    const splitedLine = line.split(' ');
                    switch(splitedLine[0]) {
                        case 'v': {
                            const slicedLine = line.slice(1);
                            const values = slicedLine.split(' ');
                            newMeshProp.vertices.set(vIndex++, {
                                x: parseFloat(values[1]),
                                y: parseFloat(values[3]),
                                z: parseFloat(values[2])
                            })
                            break;
                        }

                        case 'vn': {
                            const slicedLine = line.slice(1);
                            const values = slicedLine.split(' ');
                            newMeshProp.vertexNormals.set(vnIndex++, {
                                x: parseFloat(values[1]),
                                y: parseFloat(values[3]),
                                z: parseFloat(values[2])
                            })
                            break;
                        }

                        case 'f': {
                            const slicedLine = line.slice(1);
                            const values = slicedLine.split(' ');
                            newMeshProp.faces.set(fIndex++, {
                                v1: parseInt(values[1][0]),
                                v2: parseInt(values[2][0]),
                                v3: parseInt(values[3][0])
                            })
                            break;
                        }
                    }
                }
            });

            meshProps.push(newMeshProp);
        });

        // Create Layer map
        const layerMap:Map<string, DXFLayer> = new Map();
        meshProps.forEach((r, index) => {
            const convertedLayerName = UnicodeConverter.convertStringToUnicode(r.createdFrom.name);
            layerMap.set(r.createdFrom.name, new DXFLayer(convertedLayerName, r.createdFrom.colorIndex));
        });
        
        // DXF Writing
        // RegisterLayers
        layerMap.forEach((value) => {
            dxfWriter.registerLayer(value);
        });

        meshProps.forEach(prop => {
            const layer = layerMap.get(prop.createdFrom.name);
            prop.faces.forEach((value, key) => {
                const triangle3d = new Triangle3d({
                        v1: prop.vertices.get(value.v1),
                        v2: prop.vertices.get(value.v2),
                        v3: prop.vertices.get(value.v3),
                    }, 
                    layer
                );
                dxfWriter.addComponent(triangle3d);
            });
        })

        dxfWriter.exportAsDXFFile('KOR');
    }

    static async exportBoringsDXF(language: 'ENG'|'KOR'|'JPN') {
        const dxfWriter = new DXFWriter();

        // Load boring datas;
        const boringDatas = await window.electronBoringDataAPI.fetchAllBorings();
        const layerDatas = await window.electronBoringDataAPI.getAllLayerColors();
        if(!boringDatas || !boringDatas.result || !layerDatas || !layerDatas.result) {
            alert('내보내기 오류.');
            return;
        }

        // Register layers
        const layerMap: Map<string, DXFLayer> = new Map();
        layerDatas.layerColors.forEach((layerInfo, index) => {
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
        const boringEnds = boringDatas.fetchedBorings.flatMap(boring => 
            boring.topoTop - boring.layers.flatMap(ly => ly.thickness).reduce((thickness, sum) => sum += thickness, 0)
        );

        const zMin = Math.min(...boringEnds);

        // Create boring shapes
        boringDatas.fetchedBorings.forEach(boring => {
            this.addBoringShape(boring, dxfWriter, layerMap, textLayer, textNormalStyle, textSmallStyle, zMin-2);
        });

        // Export as file
        dxfWriter.exportAsDXFFile(language);
    }

    private static addBoringShape(boring: BoringDTO, dxfWriter: DXFWriter, postLayers: Map<string, DXFLayer>, textLayer: DXFLayer, layerTextStyle: TextStyle, sptTextStyle: TextStyle, zMin = 0) {
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
            const cylinder = new Cylinder({x: x, y: y, z: layerTop - layer.thickness}, radius, layer.thickness, 64, postLayer, -1);
            dxfWriter.addComponent(cylinder);

            // Create leader
            const line = new Line(
                {x: x+radius, y: y, z: layerTop},
                {x: x+radius+8, y: y, z: layerTop},
                textLayer,
            );
            dxfWriter.addComponent(line);

            // Create Text
            const convertedLayerName = UnicodeConverter.convertStringToUnicode(layer.name);
            const text = new Text3d(
                `${convertedLayerName} (${layerTop.toFixed(2)})`,
                'XZ',
                {x: x+radius+9, y: y, z: layerTop},
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
            {x: x+radius+9, y: y, z: layerTop},
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
    }
}