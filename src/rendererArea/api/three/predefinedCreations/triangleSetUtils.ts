import { ModelType } from "@/mainArea/models/modelType";
import { Index2d, TriangleSet } from "@/mainArea/types/triangleDataSet";
import { Vector3d } from "@/mainArea/types/vector";
import { colorPaletteValues } from "@/public/colorPalette";
import { useVisibilityOptionStore } from "@/rendererArea/homescreenitems/visibilityOptionsStore";
import { VectorUtils, Vertex3d } from "jakke-graphics-ts";
import * as THREE from 'three';

export function createMeshFromTriangleSet(dataSet: TriangleSet, colorIndex: number): THREE.Object3D {
    console.log(dataSet);
    
    // Set points map
    const { pts, anchor: anc, rotation: rot, resolution: res, maxI, maxJ } = dataSet;
    const vertices: number[] = [];
    const indices: number[] = [];
    const vertexMap = new Map<string, number>()
    const anchor:Vertex3d = {...anc, z: 0};
    const zCoordMap: Map<string, number> = new Map();
    for(const zCoord of pts) {
        zCoordMap.set(`${zCoord.i}_${zCoord.j}`, zCoord.z);
    }

    const getTransformedVertex = (i: number, j: number): Vertex3d => {
        const z = zCoordMap.get(`${i}_${j}`) || 0;
        const originalPt = { x: i * res, y: j * res, z: z };
        const rotatedPt = VectorUtils.rotateOnXY(originalPt, rot);
        return VectorUtils.add(rotatedPt, { x: anchor.x, y: anchor.y, z: 0 });
    };

    // Set three factors
    for (let i = 0; i <= maxI; i++) {
        for (let j = 0; j <= maxJ; j++) {
            const vertex = getTransformedVertex(i, j);
            const hash = `${i}_${j}`;
            if (!vertexMap.has(hash)) {
                vertexMap.set(hash, vertices.length / 3);
                vertices.push(vertex.x, vertex.y, vertex.z);
            }
        }
    }

    // Create triangles
    for (let i = 0; i < maxI; i++) {
        for (let j = 0; j < maxJ; j++) {
            const index0 = vertexMap.get(`${i}_${j}`)!;
            const index1 = vertexMap.get(`${i + 1}_${j}`)!;
            const index2 = vertexMap.get(`${i}_${j + 1}`)!;
            const index3 = vertexMap.get(`${i + 1}_${j + 1}`)!;

            indices.push(index0, index1, index2);
            indices.push(index1, index3, index2);
        }
    }

    console.log()
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    const colorCode = colorPaletteValues[colorIndex];
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
    }

    // Add edges
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    mesh.add(edges);
    
    return mesh;
}