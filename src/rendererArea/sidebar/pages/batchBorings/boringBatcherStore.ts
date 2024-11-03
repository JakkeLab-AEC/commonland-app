import { LayerColorConfig } from "../../../../mainArea/models/uimodels/layerColorConfig";
import { Boring } from "../../../../mainArea/models/serviceModels/boring/boring";
import { create } from "zustand";

interface BoringBatcherStore {
    unbatchedBorings: Map<string, Boring>;
    unbacthedBoringDisplayItems: Map<string, {displayString: string, checked: boolean}>;
    batchedBorings: Map<string, Boring>;
    bacthedBoringDisplayItems: Map<string, {displayString: string, checked: boolean}>;
    layerColorConfig: LayerColorConfig
    fetchAllBorings:() => void;
    batchBorings: (ids: string[]) => void;
    unbatchBorings: (ids: string[]) => void;
    updateBatchedBoringDisplayItem: (id: string, checked: boolean) => void;
    updateUnbatchedBoringDisplayItem: (id: string, checked: boolean) => void;
    fetchAllLayerColors:() => void;
    updateLayerColor:(name: string, colorIndex: number) => void;
}

function boringSort(a: string, b: string): number {
    const matchA = a.match(/(\d+)/);
    const matchB = b.match(/(\d+)/);

    if (matchA && matchB) {
        const numberA = parseInt(matchA[0], 10);
        const numberB = parseInt(matchB[0], 10);
        return numberA - numberB;
    } else if (matchA) {
        return 1;
    } else if (matchB) {
        return -1;
    } else {
        return a.localeCompare(b);
    }
}

export const useBoringBatcherStore = create<BoringBatcherStore>((set, get) => ({
    unbatchedBorings: new Map(),
    unbacthedBoringDisplayItems: new Map(),
    batchedBorings: new Map(),
    bacthedBoringDisplayItems: new Map(),
    layerColorConfig: new LayerColorConfig([]),
    fetchAllBorings: async () => {
        const batchedBorings: Map<string, Boring> = new Map();
        const bacthedBoringDisplayItems: Map<string, {displayString: string, checked: boolean}> = new Map();
        const unbatchedBorings: Map<string, Boring> = new Map();
        const unbacthedBoringDisplayItems: Map<string, {displayString: string, checked: boolean}> = new Map();
        const fetchJob = await window.electronBoringDataAPI.fetchAllBorings();
        if(fetchJob.result) {
            fetchJob.fetchedBorings.forEach(dto => {
                if(dto.isBatched) {
                    batchedBorings.set(dto.id, Boring.deserialize(dto));
                    bacthedBoringDisplayItems.set(dto.id, {displayString: dto.name, checked: false});
                } else {
                    unbatchedBorings.set(dto.id, Boring.deserialize(dto));
                    unbacthedBoringDisplayItems.set(dto.id, {displayString: dto.name, checked: false});
                }
            });
            set(() => {
                return { 
                    batchedBorings: batchedBorings,
                    bacthedBoringDisplayItems: bacthedBoringDisplayItems,
                    unbatchedBorings: unbatchedBorings,
                    unbacthedBoringDisplayItems: unbacthedBoringDisplayItems
                }
            });
        }
    },
    batchBorings: async (ids: string[]) => {
        const options = ids.map(id => {return {id: id, option: true}})
        await window.electronBoringDataAPI.updateBoringBatch(options);
        const updatedUnbatchedBorings = new Map(get().unbatchedBorings);
        const updatedUnbacthedBoringDisplayItems = new Map(get().unbacthedBoringDisplayItems);
        const updatedBatchedBorings = new Map(get().batchedBorings);
        const updatedBatchedBoringDisplayItems = new Map(get().bacthedBoringDisplayItems);
        
        ids.forEach(id => {
            const boring = updatedUnbatchedBorings.get(id);
            updatedBatchedBorings.set(id, boring);
            updatedBatchedBoringDisplayItems.set(id, {displayString: boring.getName(), checked: false});
            
            updatedUnbatchedBorings.delete(id);
            updatedUnbacthedBoringDisplayItems.delete(id);
        });

        const sortedUnbatchedBorings = new Map(
            Array.from(updatedUnbatchedBorings.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.getName(),valueB.getName()))
        );
        
        const sortedBatchedBorings = new Map(
            Array.from(updatedBatchedBorings.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.getName(),valueB.getName()))
        );

        const sortedUnbatchedBoringDisplayItems = new Map(
            Array.from(updatedUnbacthedBoringDisplayItems.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.displayString, valueB.displayString))
        );

        const sortedBatchedBoringDisplayItems = new Map(
            Array.from(updatedBatchedBoringDisplayItems.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.displayString, valueB.displayString))
        );
        
        set(() => { 
            return {
                unbatchedBorings: sortedUnbatchedBorings,
                batchedBorings: sortedBatchedBorings,
                unbacthedBoringDisplayItems: sortedUnbatchedBoringDisplayItems,
                bacthedBoringDisplayItems: sortedBatchedBoringDisplayItems,
        }});
    },
    unbatchBorings: async (ids: string[]) => {
        const options = ids.map(id => {return {id: id, option: false}})
        await window.electronBoringDataAPI.updateBoringBatch(options);
        const updatedUnbatchedBorings = new Map(get().unbatchedBorings);
        const updatedUnbacthedBoringDisplayItems = new Map(get().unbacthedBoringDisplayItems);
        const updatedBatchedBorings = new Map(get().batchedBorings);
        const updatedBatchedBoringDisplayItems = new Map(get().bacthedBoringDisplayItems);       
        
        ids.forEach(id => {
            const boring = updatedBatchedBorings.get(id);
            updatedUnbatchedBorings.set(id, boring);
            updatedUnbacthedBoringDisplayItems.set(id, {displayString: boring.getName(), checked: false});
            
            updatedBatchedBorings.delete(id);
            updatedBatchedBoringDisplayItems.delete(id);
        });

        const sortedUnbatchedBorings = new Map(
            Array.from(updatedUnbatchedBorings.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.getName(),valueB.getName()))
        );
        
        const sortedBatchedBorings = new Map(
            Array.from(updatedBatchedBorings.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.getName(),valueB.getName()))
        );

        const sortedUnbatchedBoringDisplayItems = new Map(
            Array.from(updatedUnbacthedBoringDisplayItems.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.displayString, valueB.displayString))
        );

        const sortedBatchedBoringDisplayItems = new Map(
            Array.from(updatedBatchedBoringDisplayItems.entries())
                 .sort(([keyA, valueA], [keyB, valueB]) => boringSort(valueA.displayString, valueB.displayString))
        );

        set(() => { 
            return {
                unbatchedBorings: sortedUnbatchedBorings,
                batchedBorings: sortedBatchedBorings,
                unbacthedBoringDisplayItems: sortedUnbatchedBoringDisplayItems,
                bacthedBoringDisplayItems: sortedBatchedBoringDisplayItems,
        }});
    },
    updateBatchedBoringDisplayItem: (id: string, checked: boolean) => {
        const items = new Map(get().bacthedBoringDisplayItems);
        items.get(id).checked = checked;

        set(() => {return {bacthedBoringDisplayItems : items}});
    },
    updateUnbatchedBoringDisplayItem: (id: string, checked: boolean) => {
        const items = new Map(get().unbacthedBoringDisplayItems);
        items.get(id).checked = checked;

        set(() => {return {unbacthedBoringDisplayItems : items}});
    },
    fetchAllLayerColors: async () => {
        const fetchJob = await window.electronBoringDataAPI.getAllLayerColors();
        if(fetchJob.result) {
            set(() => {return {layerColorConfig: new LayerColorConfig(fetchJob.layerColors)}})
        }
    }, 
    updateLayerColor: async (name: string, colorIndex: number) => {
        const updateJob = await window.electronBoringDataAPI.updateLayerColor(name, colorIndex);
        if(!updateJob.result) return;

        const fetchJob = await window.electronBoringDataAPI.getAllLayerColors();
        if(fetchJob.result) {
            set(() => {return {layerColorConfig: new LayerColorConfig(fetchJob.layerColors)}})
        }
    },
}));