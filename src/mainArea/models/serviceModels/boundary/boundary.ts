import { Vector2d } from "@/mainArea/types/vector";
import { ServiceModel } from "../servicemodel";
import { BoundaryDTO } from "@/dto/serviceModel/boundaryDto";
import { ModelType } from "../../modelType";

type ConstructorOptions = {
    key?: string,
    points?: Vector2d[],
    colorIndex?: number,
}

export class Boundary extends ServiceModel {
    private points: Vector2d[];
    private name: string;
    private colorIndex: number;

    constructor({key, points = [], colorIndex = 1}: ConstructorOptions) {
        super(key);
        this.points = points;
        this.colorIndex = colorIndex;
    }

    setName(name: string) {
        this.name = name;
    }

    serialize(): BoundaryDTO {
        return {
            modelType: ModelType.Boundary,
            id: this.elementId.getValue(),
            threeObjId: this.getThreeObjId(),
            name: this.name,
            colorIndex: this.colorIndex,
            pts: this.points,
        }
    }
}