import { ModelType } from "@/mainArea/models/modelType";
import { TriangleSet } from "@/mainArea/types/triangleDataSet";
import { Vector3d } from "@/mainArea/types/vector";
import { colorPaletteValues } from "@/public/colorPalette";
import { useVisibilityOptionStore } from "@/rendererArea/homescreenitems/visibilityOptionsStore";
import { zip } from "d3";
import * as THREE from 'three';

type PointIndexAttached = {index: number, point: Vector3d};

export function createMeshFromTriangleSet(dataSet: TriangleSet, colorIndex: number): THREE.Object3D {
    // Set points map
    const vertices: number[] = [];
    const ptMap: Map<string, PointIndexAttached> = new Map();
    dataSet.pts.forEach((p, index) => {
        ptMap.set(p.hash, {index: index, point: p.pt});
        vertices.push(p.pt.x, p.pt.y, p.pt.z);
    });

    // Set three factors
    const indices: number[] = [];
    dataSet.triangles.forEach(t => {
        const pt0Index = ptMap.get(t.hashPt0)?.index;
        const pt1Index = ptMap.get(t.hashPt1)?.index;
        const pt2Index = ptMap.get(t.hashPt2)?.index;

        indices.push(pt0Index, pt1Index, pt2Index);
    });

    console.log(vertices);
    console.log(dataSet);
    console.log(indices);
    
    
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
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