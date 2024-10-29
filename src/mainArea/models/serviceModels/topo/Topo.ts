import { TopoDTO } from "@/dto/serviceModel/topoDto";
import { ElementId } from "../../id";
import { ServiceModel } from "../servicemodel";
import { ModelType } from "../../modelType";

export class Topo extends ServiceModel {
    readonly elementId: ElementId;
    readonly modelType: ModelType = ModelType.Topo;
    private name: string;
    private points: Map<string, {
        x: number,
        y: number,
        z: number,
    }>;
    private colorIndex: number;
    private isBatched: boolean;
    
    constructor(isBatched = false, name: string, key?: string) {
        super(key);
        this.points = new Map();
        this.name = name;
        this.isBatched = isBatched;
        this.colorIndex = 1;
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
            name: this.name,
            points: this.getAllPoints(),
            colorIndex: this.colorIndex,
            isBatched: this.isBatched ? 1 : 0,
        }

        return dto;
    }

    static deserialize(data: TopoDTO):Topo {
        const topo = new Topo(data.isBatched == 1, data.name, data.id);
        topo.colorIndex = data.colorIndex;
        data.points.forEach(pt => {
            topo.registerPoint({x: pt.x, y: pt.y, z: pt.z}, pt.id);
        });

        return topo;
    }
}