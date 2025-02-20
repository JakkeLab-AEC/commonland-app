import { Vector2d } from '@/mainArea/types/vector';
import * as THREE from 'three';

export function createOBBShape(obb: { center: Vector2d; size: Vector2d; angle: number }): THREE.Object3D[] {
    const { center, size, angle } = obb;

    // OBB Plane (Bounding Box)
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const material = new THREE.LineBasicMaterial({ color: 0xff8800 });

    // OBB Mesh
    const edges = new THREE.EdgesGeometry(geometry);
    const obbLines = new THREE.LineSegments(edges, material);

    // 중심점을 나타내는 Sphere
    const centerPoint = new THREE.Mesh(
        new THREE.SphereGeometry(2), // 점 크기 조정 가능
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );

    // 회전 적용 (Degree → Radian 변환)
    obbLines.rotation.z = angle * Math.PI / 180;

    // 변환 행렬 적용 (중심 좌표로 이동)
    const translate = new THREE.Matrix4().makeTranslation(center.x, center.y, 0);
    obbLines.applyMatrix4(translate);

    // 중심점 위치 설정
    centerPoint.position.set(center.x, center.y, 0);

    return [obbLines, centerPoint];
}
