import { ElementCategory } from "../model/elementModelCategory";

export interface ElementModelDTO<TCategory extends ElementCategory> {
    elementId: string,
    category: TCategory,
}