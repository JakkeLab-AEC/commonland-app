import { LayerColorConfig } from "@/mainArea/models/uimodels/layerColorConfig";
import { Boring } from "../../../../mainArea/models/serviceModels/boring/boring";
import { create } from "zustand";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import { ThreeBoringPost } from "@/rendererArea/api/three/predefinedCreations/boringPost";

interface EditorPageStore {
    borings: Map<string, Boring>;
    boringDisplayItems: Map<string, {displayString :string, checked: boolean}>;
    selectedBoringId: string;
    updateEventListners: Array<() => void>;
    checkedBoringIds:Set<string>;
    layerColorConfig: LayerColorConfig;
    fetchAllBorings:() => Promise<void>;
    createNewBoring: () => void;
    insertBoring: (boring: Boring) => Promise<boolean>;
    updateBoring: (boring: Boring) => Promise<boolean>;
    registerUpdateEventListner: (listner: () => void) => void;
    removeBoring: (id: string[]) => Promise<boolean>;
    selectBoring: (id: string) => Boring;
    unselectBoring: () => void;
    searchBoringName: (name: string, id?: string) => Promise<'found'|'notfound'|'internalError'>
    searchBoringNamePattern: (prefix: string, index: number) => Promise<string[]>;
    saveCheckedBoringIds: (ids: Set<string>) => void;
    updateBoringDisplayItem: (id: string, checked: boolean) => void;
    fetchAllLayerColors:() => Promise<void>;
    updateLayerColor:(name: string, colorIndex: number) => Promise<void>;
}

export const useEditorPageStore = create<EditorPageStore>((set, get) => ({
    borings: new Map(),
    boringDisplayItems: new Map(),
    selectedBoringId: null,
    updateEventListners: [],
    checkedBoringIds: new Set(),
    layerColorConfig: new LayerColorConfig([]),
    fetchAllBorings: async () => {
        const fetchJob = await window.electronBoringDataAPI.fetchAllBorings();
        if(fetchJob.result) {
            const borings:[string, Boring][] = [];
            const boringDisplayItems:[string, {displayString: string, checked: boolean}][] = [];
            fetchJob.fetchedBorings.forEach(boring => {
                // Get target boring and add to borings
                const targetBoring = Boring.deserialize(boring);
                borings.push([targetBoring.getId().getValue(), targetBoring]);

                // Get boring display items from former status;
                const formerStatus = get().boringDisplayItems;
                const formerChecked = formerStatus.get(targetBoring.getId().getValue());
                boringDisplayItems.push([
                    targetBoring.getId().getValue(), 
                    {displayString: targetBoring.getName(), checked: formerChecked ? formerChecked.checked : false}
                ]);
            });

            const newBorings: Map<string, Boring> = new Map(borings);
            const newBoringDisplayItems: Map<string, {displayString: string, checked: boolean}> = new Map(boringDisplayItems);
            set(() => { 
                return {
                    borings: newBorings,
                    boringDisplayItems: newBoringDisplayItems
                }
            });
        }
    },
    createNewBoring: () => {
        
    },
    insertBoring: async (boring: Boring) => {
        // Update new layers' color
        const layerColorConfig =  get().layerColorConfig;
        boring.getLayers().forEach(layer => {
            const layerName = layer.getName();
            if(!layerColorConfig.getLayerColor(layerName)) {
                layerColorConfig.registerColor(layerName, 1);
                set(() => {
                    return { layerColorConfig: layerColorConfig }
                });
            }
        });

        // Create boring item
        const createdBoringObject = await ThreeBoringPost.createPostFromModel(boring, layerColorConfig);
        boring.setThreeObjId(createdBoringObject.uuid);
        
        const boringDto = boring.serialize();
        const insertJob = await window.electronBoringDataAPI.insertBoring(boringDto);
        if(insertJob.result) {
            const updatedBorings = new Map(get().borings);
            updatedBorings.set(boring.getId().getValue(), boring);
            set(() => {
                return { borings: updatedBorings }
            })

            SceneController.getInstance().addObject(createdBoringObject);
            return true;
        }
        return false;
    },
    updateBoring: async (boring: Boring) => {
        // Update new layers' color
        const layerColorConfig =  get().layerColorConfig;
        console.log(layerColorConfig);
        boring.getLayers().forEach(layer => {
            const layerName = layer.getName();
            console.log(layerColorConfig.getLayerColor(layerName));
            if(!layerColorConfig.getLayerColor(layerName)) {
                layerColorConfig.registerColor(layerName, 1);
                set(() => {
                    return { layerColorConfig: layerColorConfig }
                });
            }
        });

        // Get old three object id and update it
        const oldThreeObjId = boring.getThreeObjId();
        const createdBoringObject = await ThreeBoringPost.createPostFromModel(boring, layerColorConfig);
        boring.setThreeObjId(createdBoringObject.uuid);

        const updateJob = await window.electronBoringDataAPI.updateBoring(boring.serialize());
        if(updateJob.updateError) {
            alert(updateJob.updateError.message);
            set(() => {
                return {updateEventListners: []}
            });
            return false;
        }
        get().updateEventListners.forEach(listner => listner());
        get().fetchAllBorings();

        set(() => {
            return {updateEventListners: []}
        })

        // Remove and add object
        SceneController.getInstance().removeObjectByUUIDs([oldThreeObjId]);
        SceneController.getInstance().addObject(createdBoringObject);

        return true;
    },
    removeBoring: async (ids: string[]) => {
        const targetBoringThreeIds: string[] = [];
        const borings = get().borings;
        ids.forEach((id) => {
            targetBoringThreeIds.push(borings.get(id).getThreeObjId());
        });

        const removeJob = await window.electronBoringDataAPI.removeBoring(ids);
        if(removeJob.result) {
            get().fetchAllBorings();
            SceneController.getInstance().removeObjectByUUIDs(targetBoringThreeIds);
            return true;
        }

        return false;
    },
    selectBoring: (id: string) => {
        const status = get();
        set(() => {
            return {selectedBoringId: id}
        })
        return status.borings.get(id);
    },
    searchBoringName: async (name: string, id?: string) => {
        const searchJob = await window.electronBoringDataAPI.searchBoringName(name, id);
        if(!searchJob) {
            return 'internalError';
        }

        if(searchJob.result) {
            return 'found';
        } else {
            if(searchJob.error) {
                return 'internalError';
            } else {
                return 'notfound';
            }
        }
    },
    searchBoringNamePattern: async (prefix: string, index: number) => {
        const searchJob = await window.electronBoringDataAPI.searchBoringNamePattern(prefix, index);
        if(searchJob.result) {
            return searchJob.searchedNames;
        } else {
            if(searchJob.searchedNames) {
                return searchJob.searchedNames;
            } else {
                return null;
            }
        }
    },
    unselectBoring: () => {
        set(() => {
            return {selectedBoringId: null}
        })
    },
    registerUpdateEventListner:(listner: () => void) => {
        const state = get();
        const updatedListners = [...state.updateEventListners];
        updatedListners.push(listner);
        set(() => { return { updateEventListners: updatedListners}});
    },
    saveCheckedBoringIds: (ids: Set<string>) => {
        set(() => { return {checkedBoringIds : ids}});
    },
    updateBoringDisplayItem: (id: string, checked: boolean) => {
        const items = new Map(get().boringDisplayItems);
        items.get(id).checked = checked;

        set(() => {return {boringDisplayItems : items}});
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
            SceneController.getInstance().getViewportControl().updateLayerColor([{layerName: name, colorIndex: colorIndex}]);
        }
    },
}));