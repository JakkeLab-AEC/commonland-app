import { ElementModelDTO } from "@/common/dto/elementModelDto";
import { ElementModel } from "../elementModel";
import { ElementCategory } from "../elementModelCategory";
import * as JG from 'jakke-graphics-ts';

type Face = {type: 'triangle'|'quadrant', indices: number[]}

export enum TopoType {
    Delaunay = 'Delaunay',
    OrdinaryKriging = 'OrdinaryKriging',
}

export interface ElementTopoOption<TTopotype extends TopoType> {
    elementIdValue?: string;
    vertices: {index: number, v: JG.Vertex3d}[],
    faces: Face[],
    colorIndex?: number,
    resolution: number;
    topoType: TTopotype;
}

export abstract class ElementTopo<TTopotype extends TopoType> extends ElementModel<ElementCategory.Topo> {
    constructor(option: ElementTopoOption<TTopotype>) {
        const { 
            elementIdValue,
            topoType,
            colorIndex,
            vertices,
            faces,
        } = option;
        super(ElementCategory.Topo, elementIdValue);
        this.topoType = topoType;
        this.colorIndex = colorIndex ?? 1;
        this.bvhTree = new JG.BVHTree();
        this._isBvhTreeBuilt = false;
        this.vertices = vertices;
        this.faces = faces;
    }

    readonly topoType: TTopotype;
    protected colorIndex: number;
    protected vertices: {index: number, v: JG.Vertex3d}[];
    protected faces: Face[];
    private bvhTree: JG.BVHTree;
    private _isBvhTreeBuilt: boolean;
    get isBvhTreeBuilt() {return this._isBvhTreeBuilt;}

    buildBVHTree(): void {
        const verticesMap: Map<number, JG.Vertex3d> = new Map();
        const bvhTriangles: JG.BVHTriangle[] = [];

        this.vertices.forEach(v => verticesMap.set(v.index, v.pt));
        this.faces.forEach(f => {
            if(f.indices.length === 4) {
                const p0 = verticesMap.get(f.indices[0]);
                const p1 = verticesMap.get(f.indices[1]);
                const p2 = verticesMap.get(f.indices[2]);
                const p3 = verticesMap.get(f.indices[3]);
                if(!p0 || !p1 || !p2 || !p3) return;

                const triangles = GraphicsUtils.splitQuadrant(p0, p1, p2, p3);
                if(triangles.t0 && triangles.t1) {
                    const t0 = triangles.t0;
                    const t1 = triangles.t1;
                    const bvhT0 = new JG.BVHTriangle(t0.p0, t0.p1, t0.p2);
                    const bvhT1 = new JG.BVHTriangle(t1.p0, t1.p1, t1.p2);
                    bvhTriangles.push(bvhT0, bvhT1);
                }
            } else if(f.indices.length === 3) {
                const p0 = verticesMap.get(f.indices[0]);
                const p1 = verticesMap.get(f.indices[1]);
                const p2 = verticesMap.get(f.indices[2]);
                if(!p0 || !p1 || !p2) return;

                const triangle = new JG.BVHTriangle(p0, p1, p2);
                bvhTriangles.push(triangle);
            }
        });

        bvhTriangles.forEach(t => this.bvhTree.addTriangle(t));
        this._isBvhTreeBuilt = true;
    }
}