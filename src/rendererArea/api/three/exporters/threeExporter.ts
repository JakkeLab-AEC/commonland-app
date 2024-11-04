import * as THREE from 'three';
import { SceneController } from '../SceneController';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { ModelType } from '@/mainArea/models/modelType';
import { DXFLayer, DXFWriter, Triangle3d } from '../../dxfwriter/dxfwriter';
import { TopoDTO } from '@/dto/serviceModel/topoDto';

interface MeshProp {
    createdFrom: TopoDTO,
    vertices: Map<number, {x: number, y: number, z: number}>,
    vertexNormals:  Map<number, {x: number, y: number, z: number}>,
    faces:  Map<number, {v1: number, v2: number, v3: number}>
}

export class ThreeExporter {
    static exportAsObjAndMtl() {
        const scene = SceneController.getInstance().getScene();
        
        // OBJExporter로 obj 파일 내보내기
        const objExporter = new OBJExporter();
        const objContent = objExporter.parse(scene);

        // 재질 정보 수동 생성 (기본적으로 Lambert 재질 사용)
        const mtlContent = scene.children.map((child: any) => {
            if (child.material) {
                const material = child.material;
                return `
                    newmtl ${material.name}
                    Ka ${material.color.r} ${material.color.g} ${material.color.b}
                    Kd ${material.color.r} ${material.color.g} ${material.color.b}
                    Ks 0.000000 0.000000 0.000000
                    d 1.0
                    illum 2
                    Ns 0.000000
                    `;
                }
            return '';
        }).join('\n');

        // OBJ 파일 다운로드 링크 생성
        this.downloadFile('scene.obj', objContent);
        
        // MTL 파일 다운로드 링크 생성
        this.downloadFile('scene.mtl', mtlContent);
    }

    static downloadFile(fileName: string, content: string) {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    static exportTopos() {
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
        meshProps.forEach(r=>layerMap.set(r.createdFrom.name, new DXFLayer(r.createdFrom.name, r.createdFrom.colorIndex)));
        
        // DXF Writing
        // RegisterLayers
        layerMap.forEach((value, key) => {
            dxfWriter.registerLayer(new DXFLayer(key, value.color));
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

        dxfWriter.exportAsDXFFile();
    }
}