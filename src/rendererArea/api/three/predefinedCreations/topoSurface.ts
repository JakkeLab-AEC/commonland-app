import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { colorPaletteValues } from "@/public/colorPalette";
import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import Delaunator from "delaunator";

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export class ThreeTopoSurface {
    static createTopoSurfaceByPoints(points3d: Point3D[], color = 0xcbff96): THREE.Object3D {
        const indexDelaunay = Delaunator.from(
            points3d.map(p => [p.x, p.z])
        )

        console.log(indexDelaunay);

        const pts = points3d.map(p => new THREE.Vector3(p.x, p.z, p.y));

        const geom = new THREE.BufferGeometry().setFromPoints(pts);

        const meshIndex = [];
        for(let i = 0; i < indexDelaunay.triangles.length; i++) {
            meshIndex.push(indexDelaunay.triangles[i]);
        }

        const mesh = new THREE.Mesh(
            geom,
            new THREE.MeshPhongMaterial({
                color: color,
            })
        )
        
        return mesh;
    }

    static createTopoSurface(topo: Topo): THREE.Object3D {
        const pts = topo.getAllPoints().map(pt => new THREE.Vector3(pt.x, pt.y, pt.y));
        return this.createTopoSurfaceByPoints(pts);
    }
}