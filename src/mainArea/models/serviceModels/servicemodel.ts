import { ElementId } from "../id";
import { IModelBase } from "../iModelBase";
import { ModelType } from "../modelType";

export class ServiceModel implements IModelBase {
    readonly elementId: ElementId;
    readonly modelType: ModelType;
    protected constructor(key?: string) {
        if(key) {
            this.elementId = ElementId.createByValue(key);
        } else {
            this.elementId = new ElementId();
        }

        this.modelType = ModelType.Service;
    }
}