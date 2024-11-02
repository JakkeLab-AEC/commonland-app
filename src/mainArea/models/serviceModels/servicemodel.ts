import { ElementId } from "../id";
import { IModelBase } from "../iModelBase";
import { ModelType } from "../modelType";

export class ServiceModel implements IModelBase {
    readonly elementId: ElementId;
    readonly modelType: ModelType;
    private threeObjId: string;
    
    protected constructor(key?: string) {
        if(key) {
            this.elementId = ElementId.createByValue(key);
        } else {
            this.elementId = new ElementId();
        }
        this.modelType = ModelType.Service;
    }

    getThreeObjId(): string {
        return this.threeObjId;
    }

    setThreeObjId(id: string): void {
        this.threeObjId = id;
    }    
}