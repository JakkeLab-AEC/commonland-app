import * as THREE from 'three';
import { BoundaryDTO } from '@/dto/serviceModel/boundaryDto';
import { ModelType } from '@/mainArea/models/modelType';

export function createBoundaryObject(boundaryDto: BoundaryDTO): THREE.Object3D {
    const threePts = boundaryDto.pts.map(p => new THREE.Vector3(p.x, p.y, 0));
    threePts.push(new THREE.Vector3(boundaryDto.pts[0].x, boundaryDto.pts[0].y, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(threePts);
    const material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 4});
    const polyline = new THREE.Line(geometry, material);

    polyline.uuid = boundaryDto.threeObjId;
    polyline.userData = {
        modelCreatedFrom: 'CommonLandApp',
        type: ModelType.Boundary,
        instanceId: boundaryDto.id
    }

    return polyline;
}