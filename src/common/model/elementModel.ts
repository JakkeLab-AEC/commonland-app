import { ElementId } from "@/mainArea/models/id";
import { ElementCategory } from "./elementModelCategory";
import { ElementModelDTO } from "../dto/elementModelDto";

export abstract class ElementModel<TCategory extends ElementCategory> {
    constructor(category: TCategory, elementIdValue?: string, isVisible?: boolean) {
        this.category = category;
        this.elementId = elementIdValue ? ElementId.createByValue(elementIdValue) : new ElementId();
        this.isVisible = isVisible ?? true;
    }

    readonly elementId: ElementId;
    readonly category: TCategory;
    protected isVisible: boolean;

    abstract serialize(): ElementModelDTO<TCategory>;
    toggleVisibility(isVisible: boolean): void {
        this.isVisible = isVisible;
    }
}