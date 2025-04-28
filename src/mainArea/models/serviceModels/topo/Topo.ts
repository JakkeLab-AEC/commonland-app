import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { ElementId } from "../../id";
import { ServiceModel } from "../servicemodel";
import { ModelType } from "../../modelType";
import { TopoType } from "../../topoType";
import { TriangleSet } from "@/mainArea/types/triangleDataSet";


export class Topo extends ServiceModel {
    readonly elementId: ElementId;
    readonly modelType: ModelType = ModelType.Topo;
    readonly topoType: TopoType;
    private name: string;
    private points: Map<string, {
        x: number,
        y: number,
        z: number,
    }>;
    private triangleSet: TriangleSet;
    private colorIndex: number;
    private isBatched: boolean;
    private resolution: number;
    
    constructor({isBatched = false, name, key, topoType, resolution = 1}:{isBatched:boolean, name: string, key?: string, topoType: TopoType, resolution?: number}) {
        super(key);
        this.points = new Map();
        this.name = name;
        this.isBatched = isBatched;
        this.colorIndex = 1;
        this.topoType = topoType;
        this.resolution = resolution;
    }

    getColorIndex() {
        return this.colorIndex;
    }

    setColorIndex(colorIndex: number) {
        this.colorIndex = colorIndex;
    }

    registerPoint(point: {x: number, y: number, z: number}, key?: string) {
        this.points.set(new ElementId().getValue(), point);
    }

    unregisterPoint(id: string) {
        this.points.delete(id);
    }

    getAllPoints() {
        const result: {id: string, x: number, y: number, z: number}[] = [];
        this.points.forEach((value, key) => {
            result.push({id: key, x: value.x, y: value.y, z: value.z});
        });

        return result;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    serialize(): TopoDTO {
        const dto: TopoDTO = {
            id: this.elementId.getValue(),
            modelType: ModelType.Topo,
            topoType: this.topoType,
            name: this.name,
            points: this.getAllPoints(),
            colorIndex: this.colorIndex,
            isBatched: this.isBatched ? 1 : 0,
            threeObjId: this.getThreeObjId(),
            resolution: this.resolution
        }

        return dto;
    }

    static deserialize(data: TopoDTO):Topo {
        const topo = new Topo({isBatched: data.isBatched == 1, name: data.name, key: data.id, topoType: data.topoType});
        topo.setThreeObjId(data.threeObjId);
        topo.colorIndex = data.colorIndex;

        if(data.topoType === TopoType.DelaunayMesh) {
            data.points.forEach(pt => {
                topo.registerPoint({x: pt.x, y: pt.y, z: pt.z}, pt.id);
            });
        } else if(data.topoType === TopoType.OrdinaryKriging) {
            data.points.forEach(pt => {
                topo.registerPoint({x: pt.x, y: pt.y, z: pt.z});
            });

            topo.triangleSet = data.triangles;
        }

        return topo;
    }
}