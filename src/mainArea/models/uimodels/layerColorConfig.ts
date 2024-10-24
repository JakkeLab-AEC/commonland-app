import { ElementId } from "../id";
import { IModelBase } from "../iModelBase";
import { ModelType } from "../modelType";

export class LayerColorConfig implements IModelBase {
    readonly elementId: ElementId;
    readonly modelType: ModelType = ModelType.LayerConfig;
    
    private layerColorMap: Map<string, number>

    constructor(layers: [string, number][], key? :string) {
        this.elementId = new ElementId
        this.layerColorMap = new Map(layers);
    }

    getAllLayerColors():{name: string, index: number}[] {
        const layerColorSet:{name: string, index: number}[] = [];
        this.layerColorMap.forEach((value, key) => {
            layerColorSet.push({name: key, index: value});
        });

        return layerColorSet;
    }

    getLayerColor(name: string) {
        return this.layerColorMap.get(name);
    }

    registerColor(layerName: string, index: number) {
        this.layerColorMap.set(layerName, index);
    }

    unregisterColor(layerName: string){
        this.layerColorMap.delete(layerName);
    }
}