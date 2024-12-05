import * as THREE from 'three';
import Delaunator from 'delaunator';
import { Topo } from '@/mainArea/models/serviceModels/topo/Topo';
import { colorPaletteValues } from '@/public/colorPalette';
import { ModelType } from '@/mainArea/models/modelType';
import { useVisibilityOptionStore } from '@/rendererArea/homescreenitems/visibilityOptionsStore';

type Point3d = { x: number; y: number; z: number; index: number };

export function createDelaunatedMesh(topo: Topo) {
    // Extract topo's points
    const pts = topo.getAllPoints();
    
    // Convert as Point3d
    const convertedPts: Point3d[] = pts.map((pt, index) => {
        return {
            x: pt.x,
            y: pt.y,
            z: pt.z,
            index: index
        }
    });

    // Flatten coords and create Delaunator instance;
    const coords: number[] = convertedPts.flatMap(p => [p.x, p.y]);
    const delaunation = new Delaunator(coords);
    const triangles = delaunation.triangles;

    // Prepare mesh vertex and index factors
    const vertices: number[] = [];
    const indices: number[] = [];

    convertedPts.forEach(point => {
        vertices.push(point.x, point.z, point.y); // 3D 좌표를 vertices 배열에 추가
    });


    for(let i = 0; i < delaunation.triangles.length; i +=3 ) {
        indices.push(triangles[i], triangles[i + 1], triangles[i + 2]);
    }

    // Create Mesh
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals(); // 표면 노멀 계산
    
    const colorCode = colorPaletteValues[topo.getColorIndex()];
    const colorHex = parseInt(`0x${colorCode.slice(1)}`, 16);

    const material = new THREE.MeshPhongMaterial({
        color: colorHex,
        transparent: true,
        opacity: useVisibilityOptionStore.getState().currentTopoOpacity/100,
        side: THREE.DoubleSide,
        depthTest: false,

        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
        modelCreatedFrom: 'CommonLandApp',
        type : ModelType.Topo,
        createdFrom: topo.serialize(),
    }

    // Add edges
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    mesh.add(edges);
    
    return mesh;
}