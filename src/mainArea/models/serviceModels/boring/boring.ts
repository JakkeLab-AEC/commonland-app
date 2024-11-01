import { BoringDTO } from "../../../../dto/serviceModel/BoringDTO";
import { ServiceModel } from "../servicemodel";
import { Layer } from "./layer";
import { SPTResult, SPTResultSet } from "./sptResult";

export class Boring extends ServiceModel {
    private name: string;
    private locationX: number;
    private locationY: number;
    
    private topoTop: number;
    private undergroundWater: number;
    
    private layers: Layer[];
    private sptResultSet: SPTResultSet;

    private isBatched: boolean;
    private isBatchable: boolean;

    addLayer(layer: Layer) {
        this.layers.push(layer);
    }

    removeLayerByIndex(index: number) {
        if(this.layers.length == 0) {
            throw new Error('There is no layer of this boring.')
        } else {
            this.layers = this.layers.splice(index, 1);
        }
    }

    removeLayer(id: string) {
        const index = this.layers.findIndex(layer => layer.elementId.getValue() == id);
        if(index != -1) {
            this.layers.splice(index, 1);
        }
    }

    updateLayer(id: string, name: string, thicknes: number) {
        const index = this.layers.findIndex(layer => layer.elementId.getValue() == id);
        if(index != -1) {
            this.layers[index].setName(name);
            this.layers[index].setThickness(thicknes);
        }
    }

    updateLayersByArray(layers: Layer[]) {
        this.layers = layers;
    }

    serialize():BoringDTO {
        const data: BoringDTO = {
            name: this.name,
            topoTop: this.topoTop,
            undergroundWater: this.undergroundWater,
            layers: this.layers.map((layer, index) => { 
                return {
                    id: layer.elementId.getValue(),
                    layerIndex: index,
                    name: layer.getName(),
                    thickness: layer.getThickness(),
            }}),
            location: this.getLocation(),
            sptResults: this.sptResultSet.getAllResults(),
            id: this.elementId.getValue(),
            modelType: this.modelType,
            isBatched: this.isBatched ? 1 : 0,
        }

        return data;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    getId() {
        return this.elementId;
    }

    getLocation() {
        return {
            x: this.locationX,
            y: this.locationY,
        }
    }

    getLocationX() {
        return this.locationX;
    }

    getLocationY() {
        return this.locationY;
    }

    setLocationX(coord: number) {
        return this.locationX = coord;
    }

    setLocationY(coord: number) {
        return this.locationY = coord;
    }

    getTopoTop() {
        return this.topoTop;
    }

    setTopoTop(level: number) {
        this.topoTop = level;
    }


    getUndergroundWater() {
        return this.undergroundWater;
    }

    setUndergroundWater(level: number) {
        this.undergroundWater = level;
    }

    getLayers() {
        return this.layers;
    }

    getSPTResultSet() {
        return this.sptResultSet;
    }

    getBatched() {
        return this.isBatched;
    }

    setBatched(isBatched: boolean) {
        this.isBatched = isBatched;
    }

    static deserialize(dto: BoringDTO):Boring {
        const boring = new Boring(dto.name, dto.location.x, dto.location.y, dto.topoTop, dto.undergroundWater, dto.id);
        boring.setBatched(dto.isBatched == 1 ? true : false);

        const orderedLayers = dto.layers.sort((a, b) => a.layerIndex - b.layerIndex);
        orderedLayers.forEach(layer => {
            boring.addLayer(new Layer(layer.name, layer.thickness, layer.id));
        });
        
        const orderedSpts = dto.sptResults.sort((a, b) => a.depth - b.depth);
        orderedSpts.forEach(spt => {
            boring.sptResultSet.registerResult(spt.depth, new SPTResult(spt.depth, spt.hitCount, spt.distance, spt.id));
        })

        return boring;
    }

    clone(): Boring {
        // New boring instnace
        const clonedBoring = new Boring(
            this.name, 
            this.locationX,
            this.locationY,
            this.topoTop, 
            this.undergroundWater, 
            this.elementId.getValue()
        );

        // Copy layers
        clonedBoring.layers = this.layers.map(layer => new Layer(layer.getName(), layer.getThickness(), layer.elementId.getValue()));

        // Copy spt results
        const sptResultsCopy = new SPTResultSet();
        const orderedSpts = this.sptResultSet.getAllResults();
        orderedSpts.forEach(spt => {
            sptResultsCopy.registerResult(spt.depth, new SPTResult(spt.depth, spt.hitCount, spt.distance));
        });
        clonedBoring.sptResultSet = sptResultsCopy;

        // Copy batch state
        clonedBoring.setBatched(this.isBatched);

        return clonedBoring;
    }

    constructor(
        name: string,
        locationX: number, 
        locationY: number, 
        topoTop: number, 
        undergroundWater: number,
        key?: string
    ) {
        super(key);
        this.name = name;
        this.locationX = locationX;
        this.locationY = locationY;
        this.topoTop = topoTop;
        this.undergroundWater = undergroundWater;
        this.layers = [];
        this.sptResultSet = new SPTResultSet();
        this.isBatched = false;
    }
}