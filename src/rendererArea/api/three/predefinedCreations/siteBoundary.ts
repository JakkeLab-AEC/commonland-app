import * as THREE from 'three';
import { Vector2d } from "@/mainArea/types/vector";

export function createBoundaryObject(pts: Vector2d[]): THREE.Object3D {
    const threePts = pts.map(p => new THREE.Vector3(p.x, p.y, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(threePts);
    const material = new THREE.LineBasicMaterial({color: 0x000000});
    const polyline = new THREE.Line(geometry, material);

    return polyline;
}