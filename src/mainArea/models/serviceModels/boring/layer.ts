import { ServiceModel } from "../servicemodel";

export class Layer extends ServiceModel {
    
    private name: string;
    private thickness: number;

    getName() {
        return this.name;
    }

    getThickness() {
        return this.thickness;
    }

    setName(name: string) {
        this.name = name;
    }

    setThickness(thickness: number) {
        this.thickness = thickness;
    }

    constructor(name: string, thickness: number, key?: string) {
        super(key);
        this.name = name;
        this.thickness = thickness;
    }
}