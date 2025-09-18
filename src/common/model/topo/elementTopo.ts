import { ElementModel } from "../elementModel";
import { ElementCategory } from "../elementModelCategory";
import * as JG from "jakke-graphics-ts";

export type IndexedVertex = { index: number; v: JG.Vertex3d };
export type TypedFace = { type: "triangle" | "quadrant"; indices: number[] };

export enum TopoType {
	Delaunay = "Delaunay",
	Krigged = "Krigged",
	Imported = "Imported",
}

export interface ElementTopoOption<TTopotype extends TopoType> {
	elementIdValue?: string;
	vertices: IndexedVertex[];
	faces: TypedFace[];
	colorIndex?: number;
	topoType: TTopotype;
	name: string;
}

type GetPointFlags = { bvhNotBuilt: boolean; noIntersection: boolean };
export abstract class ElementTopo<
	TTopotype extends TopoType
> extends ElementModel<ElementCategory.Topo> {
	constructor(option: ElementTopoOption<TTopotype>) {
		const { elementIdValue, topoType, colorIndex, vertices, faces, name } =
			option;
		super(ElementCategory.Topo, elementIdValue);
		this.topoType = topoType;
		this.colorIndex = colorIndex ?? 1;
		this.bvhTree = new JG.BVHTree();
		this._isBvhTreeBuilt = false;
		this.vertices = vertices;
		this.faces = faces;
		this.name = name;
	}

	private readonly BVH_Z_OFFSET = 1e2;
	readonly topoType: TTopotype;
	protected colorIndex: number;
	protected vertices: IndexedVertex[];
	protected faces: TypedFace[];
	protected name: string;
	private bvhTree: JG.BVHTree;
	private _isBvhTreeBuilt: boolean;
	get isBvhTreeBuilt() {
		return this._isBvhTreeBuilt;
	}

	buildBVHTree(): void {
		const verticesMap: Map<number, JG.Vertex3d> = new Map();
		const bvhTriangles: JG.BVHTriangle[] = [];

		this.vertices.forEach((v) => verticesMap.set(v.index, v.v));
		this.faces.forEach((f) => {
			if (f.indices.length === 4) {
				const p0 = verticesMap.get(f.indices[0]);
				const p1 = verticesMap.get(f.indices[1]);
				const p2 = verticesMap.get(f.indices[2]);
				const p3 = verticesMap.get(f.indices[3]);
				if (!p0 || !p1 || !p2 || !p3) return;

				const triangles = JG.PolygonUtils.splitQuadrant({
					p0,
					p1,
					p2,
					p3,
				});
				if (triangles.t0 && triangles.t1) {
					const t0 = triangles.t0;
					const t1 = triangles.t1;
					const bvhT0 = new JG.BVHTriangle(t0.p0, t0.p1, t0.p2);
					const bvhT1 = new JG.BVHTriangle(t1.p0, t1.p1, t1.p2);
					bvhTriangles.push(bvhT0, bvhT1);
				}
			} else if (f.indices.length === 3) {
				const p0 = verticesMap.get(f.indices[0]);
				const p1 = verticesMap.get(f.indices[1]);
				const p2 = verticesMap.get(f.indices[2]);
				if (!p0 || !p1 || !p2) return;

				const triangle = new JG.BVHTriangle(p0, p1, p2);
				bvhTriangles.push(triangle);
			}
		});

		bvhTriangles.forEach((t) => this.bvhTree.addTriangle(t));
		this._isBvhTreeBuilt = true;
	}

	getPointOnTopo(pt: JG.Vertex2d): JG.Vertex3d | undefined {
		const minZ = this.bvhTree.boundingBox.min.z - this.BVH_Z_OFFSET;
		const maxZ = this.bvhTree.boundingBox.max.z + this.BVH_Z_OFFSET;

		const p0: JG.Vertex3d = { ...pt, z: minZ };
		const p1: JG.Vertex3d = { ...pt, z: maxZ };

		return this.bvhTree.getRayCollision(p1, p0, false);
	}

	getCollisionWithLine(
		line: JG.Line,
		onlyOnLine = true
	): JG.Vertex3d | undefined {
		return this.bvhTree.getRayCollision(line.p0, line.p1, onlyOnLine);
	}

	getProjectedPolylineOnTopo(line: JG.Line): JG.Polyline3d {}
}
