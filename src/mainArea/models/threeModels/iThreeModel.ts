import { IModelBase } from "../iModelBase";
import { ThreeModelCategory } from "./threeModelCategory";

export interface IThreeModel extends IModelBase {
    readonly Category: ThreeModelCategory;
}