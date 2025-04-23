import { Vector2d } from "@/mainArea/types/vector";
import { ServiceModel } from "../servicemodel";
import { BoundaryDto } from "@/dto/serviceModel/boundaryDto";

type ConstructorOptions = {
    key?: string,
    points?: Vector2d[]
}

export class Boundary extends ServiceModel {
    private points: Vector2d[];
    private name: string;

    constructor({key, points = []}: ConstructorOptions) {
        super(key);
        this.points = points;
    }

    setName(name: string) {
        this.name = name;
    }

    serialize(): BoundaryDto {
        return {
            id: this.elementId.getValue(),
            threeObjId: this.getThreeObjId(),
            name: this.name,
            pts: this.points
        }
    }
}