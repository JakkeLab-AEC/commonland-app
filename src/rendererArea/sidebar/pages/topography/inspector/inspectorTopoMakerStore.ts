import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { create } from "zustand";

interface TopoMakerProp {
    allDepths: {boringName: string, boringId: string, location: {x: number, y: number}, layers:{layerId: string, layerName: string, layerDepth: number}[]}[],
    allLayerNames: string[],
    fetchedTopos: Map<string, Topo>,
    topoDisplayItems: Map<string, {displayString: string, checked: boolean, colorIndex: number}>,
    selectedValues: Map<string, string|null>,
    fetchAllDepths:() => void;
    insertTopo: (topo: Topo) => Promise<void>;
    fetchAllTopos: () => Promise<void>,
    selectValue: (boringId: string, layerId: string) => void,
    selectOnce: (layerName: string) => void,
    updateDisplayItemCheck: (id: string, checked: boolean) => void,
    updateDisplayItemColor: (id: string, color: number) => Promise<void>,
    removeTopos: (ids: string[]) => Promise<boolean>,
    reset: () => void,
}

export const useTopoMakerStore = create<TopoMakerProp>((set, get) => ({
    allDepths: [],
    allLayerNames: [],
    selectedValues: new Map(),
    fetchedTopos: new Map(),
    topoDisplayItems: new Map(),
    fetchAllDepths: async () => {
        const fetchBoringJob = await window.electronBoringDataAPI.fetchAllBorings();
        const valueSlot: Map<string, string|null> = new Map();
        if(fetchBoringJob.result) {
            const depths: {boringName: string, boringId: string, location: {x: number, y: number}, layers:{layerId: string, layerName: string, layerDepth: number}[]}[] = [];
            const layerNames: Set<string> = new Set();
            fetchBoringJob.fetchedBorings.forEach(boring => {
                const depth: {boringName: string, location: {x: number, y: number}, boringId: string, layers:{layerId: string, layerName: string, layerDepth: number}[]} = {
                    boringName: boring.name,
                    location: {
                        x: boring.location.x,
                        y: boring.location.y,
                    },
                    boringId: boring.id,
                    layers: [],
                };

                let layerDepth = boring.topoTop;
                for(let i = 0; i < boring.layers.length; i++) {
                    const layer = boring.layers[i];
                    depth.layers.push({layerId: layer.id, layerName: layer.name, layerDepth: layerDepth});
                    layerDepth -= layer.thickness;
                    layerNames.add(layer.name);
                }

                valueSlot.set(boring.id, null);

                depths.push(depth);
            });

            

            set(() => {
                return { 
                    allDepths: depths,
                    allLayerNames: Array.from(layerNames),
                    selectedValues: valueSlot
                }
            });
        }
    },
    fetchAllTopos: async () => {
        const fetchJob = await window.electronTopoLayerAPI.fetchAllTopos();
        if(fetchJob.result) {
            const topoMap = new Map(get().fetchedTopos);
            const newDisplayItems = new Map(get().topoDisplayItems);
            fetchJob.topoDatas.forEach(topoData => {
                const topo = Topo.deserialize(topoData);
                topoMap.set(topo.elementId.getValue(), topo);

                newDisplayItems.set(topo.elementId.getValue(), {
                    displayString: topo.getName(),
                    checked: false,
                    colorIndex: topo.getColorIndex()
                });
            })

            set(() => { return { 
                fetchedTopos: topoMap,
                topoDisplayItems: newDisplayItems,
            }});
        }
    },
    insertTopo: async (topo: Topo) => {
        const insertJob = await window.electronTopoLayerAPI.insertTopo(topo.serialize());
    },
    selectValue: (boringId: string, layerId: string) => {
        const slot = get().selectedValues;
        const updatedSlot = new Map(slot);
        updatedSlot.set(boringId, layerId);
        set(() => {return {selectedValues: updatedSlot}});
    },
    selectOnce: (layerName: string) => {
        const depths = get().allDepths;
        const newSelectedValues = new Map(get().selectedValues);
        depths.forEach(depth => {
            const index = depth.layers.findIndex(layer => layer.layerName == layerName);
            if(index != -1) {
                const layerId = depth.layers[index].layerId;
                newSelectedValues.set(depth.boringId, layerId);
            } else {
                newSelectedValues.set(depth.boringId, null);
            }
        });
        set(() => { return { selectedValues: newSelectedValues }});
    },
    reset: () => {
        set(() => {
            return {
                allDepths: [],
                allLayerNames: [],
                selectedValues: new Map(),
                topoDisplayItems: new Map()
            }
        })
    },
    updateDisplayItemCheck: (id: string, checked: boolean) => {
        const updatedDisplayItems = new Map(get().topoDisplayItems);
        const formerStatus = updatedDisplayItems.get(id);

        updatedDisplayItems.set(id, {
            displayString: formerStatus.displayString,
            checked: checked,
            colorIndex: formerStatus.colorIndex
        });

        set(() => {return {topoDisplayItems: updatedDisplayItems}});
    },
    updateDisplayItemColor: async (id: string, color: number) => {
        const updateJob = await window.electronTopoLayerAPI.updateTopoColor(id, color);
        if(updateJob.result) {
            const updatedDisplayItems = new Map(get().topoDisplayItems);
            const formerStatus = updatedDisplayItems.get(id);

            updatedDisplayItems.set(id, {
                displayString: formerStatus.displayString,
                checked: formerStatus.checked,
                colorIndex: color
            });

            set(() => {return {topoDisplayItems: updatedDisplayItems}});
        }
    },
    removeTopos: async(ids: string[]) => {
        const removeJob = await window.electronTopoLayerAPI.removeTopos(ids);
        const newDisplayItems = new Map(get().topoDisplayItems);
        if(removeJob.result) {
            ids.forEach(id => {
                newDisplayItems.delete(id);
            })

            set(() => {
                return { topoDisplayItems : newDisplayItems }
            })
        }
        
        return removeJob.result;
    }
}));