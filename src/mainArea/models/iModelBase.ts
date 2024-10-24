import { ElementId } from "./id";
import { ModelType } from "./modelType";

export interface IModelBase {
    readonly elementId: ElementId;
    readonly modelType: ModelType;
}