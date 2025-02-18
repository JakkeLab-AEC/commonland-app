import { Vector2d } from "@/mainArea/types/vector";
import { getConvexHull } from "@/mainArea/utils/convexHullUtils";
import * as THREE from 'three';

function createPointCloud(points:Vector2d[], color: number) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points.flatMap(p => [p.x, p.y, 0]));
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({ color, size: 5 });
    return new THREE.Points(geometry, material);
}

function createConvexHullLines(hull: Vector2d[], color: number) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(hull.flatMap(p => [p.x, p.y, 0]));
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.LineLoop(geometry, material);
}

export function createTextOverlay(renderer: THREE.Renderer, camera: THREE.Camera, position: THREE.Vector3, text: string) {
    const label = document.createElement("div");
    label.className = "point-label";
    label.textContent = text;
    document.body.appendChild(label);

    function updatePosition() {
        const canvas = renderer.domElement;
        const widthHalf = canvas.clientWidth / 2;
        const heightHalf = canvas.clientHeight / 2;

        const vector = position.clone().project(camera);
        label.style.left = `${widthHalf + vector.x * widthHalf}px`;
        label.style.top = `${heightHalf - vector.y * heightHalf}px`;
    }

    function animate() {
        requestAnimationFrame(animate);
        updatePosition();
    }
    animate();

    window.addEventListener("resize", updatePosition);

    return label;
}


export const createConvexHullGeometry = (points: Vector2d[]) => {
    const hull = getConvexHull(points);
    const originalPts = createPointCloud(points, 0xff0000);
    const hullPts = createPointCloud(hull, 0x0000ff);
    const lines = createConvexHullLines(hull, 0x0000ff);

    return {originalPts: originalPts, hullPts: hullPts, lines: lines, hullPtValues: hull}
}