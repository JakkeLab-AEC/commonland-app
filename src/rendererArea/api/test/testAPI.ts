import { Layer } from "../../../mainArea/models/serviceModels/boring/layer";
import { Boring } from "../../../mainArea/models/serviceModels/boring/boring";
import { SPTResult } from "../../../mainArea/models/serviceModels/boring/sptResult";

export class TestAPI {
    private values = [15, 20, 25, 30, 35, 40, 12, 24, 36, 48];
    async createTestBorings() {
        for(let i = 1; i < 11; i++) {
            const boringName = `BH-${i}`;
            const boring = new Boring(
                boringName,
                Math.random()*100,
                Math.random()*100,
                this.values[Math.trunc(Math.random()*10)],
                this.values[Math.trunc(Math.random()*10)],
            );

            let layerCount: number = Math.trunc(Math.random()*10);
            if(layerCount > 4) {
                layerCount = 4;
            } else if (layerCount == 0) {
                layerCount = 1
            }

            for(let k = 1; k < layerCount + 1; k++) {
                boring.addLayer(new Layer(`레이어${k}`, Math.trunc(Math.random()*10) + 1));
            }

            let sptCount: number = Math.trunc(Math.random());
            if(sptCount > 10) {
                sptCount = 10;
            }

            for(let k = 1; k < layerCount+1; k++) {
                boring.getSPTResultSet().registerResult(k, new SPTResult(k, Math.trunc(Math.random()*10), Math.trunc(Math.random()*100)));
            }

            await window.electronBoringDataAPI.insertBoring(boring.serialize());
        }
    }
}