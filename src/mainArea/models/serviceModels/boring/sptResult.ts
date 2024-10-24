import { ServiceModel } from "../servicemodel";

export class SPTResult extends ServiceModel {
    readonly depth: number;
    private hitCount: number;
    private distance: number;

    constructor(depth: number, hitCount: number, distance: number, key?: string) {
        super(key);
        this.depth = depth;
        this.hitCount = hitCount;
        this.distance = distance;
    }

    getHitCount() {
        return this.hitCount;
    }

    getDistance() {
        return this.distance;
    }

    setHitCount(hitCount: number){
        this.hitCount = hitCount;
    }

    setDistnace(distance: number){
        this.distance = distance;
    }
}

export class SPTResultSet extends ServiceModel {
    private results: Map<number, SPTResult>;
    
    registerResult(depth: number, result: SPTResult){
        this.results.set(depth, result);
    }

    unregisterResult(depth: number) {
        this.results.delete(depth);
    }

    updateResult(depth: number, result: SPTResult){
        this.results.set(depth, result)
    }

    buildEmptySets(totalDepth: number) {
        this.results = new Map();
        for(let i = 1; i <= totalDepth; i++){
            this.results.set(i, new SPTResult(i, 1, 1));
        }
    }
    
    getAllResults():{id: string, depth: number, hitCount: number, distance: number}[] {
        const results: {id: string, depth: number, hitCount: number, distance: number}[] = [];
        this.results.forEach((value, key) => {
            results.push({
                id: value.elementId.getValue(),
                depth: key,
                hitCount: value.getHitCount(),
                distance: value.getDistance(),
            });
        })

        return results;
    }

    constructor(key?: string) {
        super(key);
        this.results = new Map();
    }
}