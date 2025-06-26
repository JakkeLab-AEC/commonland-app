import { OBB } from "@/mainArea/models/graphics/obb";
import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { TopoType } from "@/mainArea/models/topoType";
import { TriangleSet } from "@/mainArea/types/triangleDataSet";
import { Vector2d } from "@/mainArea/types/vector";
import { createDelaunatedMesh } from "@/rendererArea/api/three/predefinedCreations/delaunayUtils";
import { createMeshFromTriangleSet } from "@/rendererArea/api/three/predefinedCreations/triangleSetUtils";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import { generateUUID } from "three/src/math/MathUtils";
import { create } from "zustand";
import * as THREE from 'three';
import { createBoundaryObject } from "@/rendererArea/api/three/predefinedCreations/siteBoundary";
import { BoundaryMetadata } from "@/dto/serviceModel/boundaryDto";
import { TopoCreationOptions } from "../options";
import { ElementId } from "@/mainArea/models/id";
import { TopoMetadataDTO } from "@/dto/serviceModel/topoDto";

type DisplayItemProps = {displayString: string, checked: boolean, colorIndex: number};
export type DepthType = {boringName: string, boringId: string, location: {x: number, y: number}, layers:{layerId: string, layerName: string, layerDepth: number}[]};

interface TopoMakerProp {
    allDepths: DepthType[],
    allLayerNames: string[],
    fetchedTopos: Map<string, TopoMetadataDTO>,
    fetchedBoundaries: Map<string, BoundaryMetadata>,
    topoDisplayItems: Map<string, DisplayItemProps>,
    boundaryDisplayItems: Map<string, DisplayItemProps>,
    selectedValues: Map<string, string|number|null>,
    fetchAllDepths:() => void;
    fetchAllTopos: () => Promise<void>,
    insertTopo: (options: TopoCreationOptions) => Promise<void>;
    selectValue: (boringId: string, layerIdOrLevel: string|number) => void,
    unselectValue: (boringId: string) => void,
    selectOnce: (layerName: string, reset?: boolean) => void,
    updateDisplayItemCheck: (id: string, checked: boolean) => void,
    updateDisplayItemColor: (id: string, color: number) => Promise<{result: boolean, updatedTopo?: TopoMetadataDTO}>,
    updateBoundaryDisplayItemCheck: (id: string, checked: boolean) => void,
    updateBoundaryDisplayItemColor: (id: string, color: number) => Promise<{result: boolean, updatedBoundary?: BoundaryMetadata}>,
    removeTopos: (ids: string[]) => Promise<{result: boolean, deletedTopos?: TopoMetadataDTO[]}>,
    insertBoundary: (name: string) => Promise<void>,
    removeBoundaries: (ids: string[]) => Promise<{result: boolean, deletedBoundaries?: BoundaryMetadata[]}>,
    fetchAllBoundaries: () => Promise<void>,
    reset: () => void,
}

export const useTopoMakerStore = create<TopoMakerProp>((set, get) => ({
    allDepths: [],
    allLayerNames: [],
    selectedValues: new Map(),
    fetchedTopos: new Map(),
    fetchedBoundaries: new Map(),
    topoDisplayItems: new Map(),
    boundaryDisplayItems: new Map(),
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
                
                // Set layer data
                let layerDepth = boring.topoTop;
                for(let i = 0; i < boring.layers.length; i++) {
                    const layer = boring.layers[i];
                    depth.layers.push({layerId: layer.id, layerName: layer.name, layerDepth: layerDepth});
                    layerDepth -= layer.thickness;
                    layerNames.add(layer.name);
                }

                // Set underground water data
                layerDepth = boring.topoTop;
                depth.layers.push({layerId: generateUUID(), layerName: '지하수위', layerDepth: layerDepth - boring.undergroundWater})

                valueSlot.set(boring.id, null);

                depths.push(depth);
            });

            
            set(() => {
                return { 
                    allDepths: depths,
                    allLayerNames: Array.from(layerNames).sort(),
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
                topoMap.set(topo.elementId.getValue(), {
                    topoType: topo.topoType,
                    name: topo.getName(),
                    threeObjId: topo.getThreeObjId(),
                    colorIndex: topo.getColorIndex(),
                    isBatched: 0,
                    id: topo.elementId.getValue(),
                    modelType: topo.modelType
                });

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
    insertTopo: async (option: TopoCreationOptions) => {
        let mesh: THREE.Object3D
        
        let insertJob: {result: boolean; message?: string; topoDataSet?: TriangleSet;};

        if(option.topoType === TopoType.DelaunayMesh) {
            const topo = new Topo({
                isBatched: option.isBatched,
                name: option.name,
                topoType: option.topoType,
            });
            topo.setThreeObjId(new ElementId().getValue());
            
            option.basePoints.forEach(p => topo.registerPoint(p));            
            mesh = createDelaunatedMesh(topo, topo.getThreeObjId());
            
            topo.setThreeObjId(mesh.uuid);
            insertJob = await window.electronTopoLayerAPI.insertTopo(topo.serialize());
        } else {
            const boundaryPts: Vector2d[] = [];
            if(option.boundary) {
                const boundaryFetch = await window.electronTopoLayerAPI.selectBoundary(option.boundary.id);
                boundaryPts.push(...boundaryFetch.boundaries[0].pts);
            } else {
                boundaryPts.push(...option.basePoints);
            }

            const obb = new OBB(boundaryPts);
            obb.expandByOffset(option.offset);

            const topo = new Topo({
                isBatched: option.isBatched,
                name: option.name,
                topoType: option.topoType,
                resolution: option.resolution,
            });
            topo.setThreeObjId(new ElementId().getValue());

            option.basePoints.forEach(p => topo.registerPoint(p));
            console.log(topo.getAllPoints());
            insertJob = await window.electronTopoLayerAPI.insertTopo(topo.serialize(), obb.serialize());

            if(!insertJob || !insertJob.result) return;

            mesh = createMeshFromTriangleSet(insertJob.topoDataSet, option.colorIndex, {
                topoType: topo.topoType,
                name: topo.getName(),
                threeObjId: topo.getThreeObjId(),
                colorIndex: topo.getColorIndex(),
                isBatched: 0,
                id: topo.elementId.getValue(),
                modelType: topo.modelType
            });
        }
        
        SceneController.getInstance().addObject(mesh);
    },
    selectValue: (boringId: string, layerIdOrLevel: string|number) => {
        const slot = get().selectedValues;
        const updatedSlot = new Map(slot);
        updatedSlot.set(boringId, layerIdOrLevel);
        set(() => {return {selectedValues: updatedSlot}});
    },
    unselectValue: (boringId: string) => {
        const slot = get().selectedValues;
        const updatedSlot = new Map(slot);
        updatedSlot.delete(boringId);
        set(() => {return {selectedValues: updatedSlot}});
    },
    selectOnce: (layerName: string, reset = false) => {
        if(reset) {
            set(() => { return { selectedValues: new Map() }});
        } else {
            const depths = get().allDepths;
            const newSelectedValues = new Map(get().selectedValues);
            depths.forEach(depth => {
            const index = depth.layers.findIndex(layer => layer.layerName === layerName);
            if(index !== -1) {
                const layerId = depth.layers[index].layerId;
                newSelectedValues.set(depth.boringId, layerId);
            } else {
                newSelectedValues.delete(depth.boringId);
            }
        });
        set(() => { return { selectedValues: newSelectedValues }});
        }
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
            const updatedTopos = new Map(get().fetchedTopos);
            const formerStatus = updatedDisplayItems.get(id);

            updatedDisplayItems.set(id, {
                displayString: formerStatus.displayString,
                checked: formerStatus.checked,
                colorIndex: color
            });

            const fetchJob = await window.electronTopoLayerAPI.fetchAllTopoMetadatas();
            console.log(fetchJob);
            if(fetchJob.result) {
                fetchJob.metadatas.forEach(topo => {
                    updatedTopos.set(topo.id, topo);
                });

                console.log(updatedDisplayItems);

                set(() => {return {
                    topoDisplayItems: updatedDisplayItems,
                    fetchedTopos: updatedTopos,
                }});
            }

            return {result: true, updatedTopo:  get().fetchedTopos.get(id)};
        }
        return {result: false};
    },
    removeTopos: async(ids: string[]) => {
        const removeJob = await window.electronTopoLayerAPI.removeTopos(ids);
        const oldTopos = get().fetchedTopos;
        const updatedTopos = new Map(oldTopos);
        const deletedTargets: Map<string, TopoMetadataDTO> = new Map();
        const newDisplayItems = new Map(get().topoDisplayItems);
        if(removeJob.result) {
            ids.forEach(id => {
                deletedTargets.set(id, oldTopos.get(id));
                newDisplayItems.delete(id);
                updatedTopos.delete(id);
            })

            set(() => {
                return { 
                    topoDisplayItems : newDisplayItems,
                    fetchedTopos: updatedTopos,
                }
            })
            return {result: removeJob.result, deletedTopos: Array.from(deletedTargets.values())};
        }
        
        return {result: false}
    },
    updateBoundaryDisplayItemCheck: (id: string, checked: boolean) => {
        const updatedDisplayItems = new Map(get().boundaryDisplayItems);
        const formerStatus = updatedDisplayItems.get(id);

        updatedDisplayItems.set(id, {
            displayString: formerStatus.displayString,
            checked: checked,
            colorIndex: formerStatus.colorIndex
        });

        set(() => {return {boundaryDisplayItems: updatedDisplayItems}});
    },
    updateBoundaryDisplayItemColor: async (id: string, color: number) => {
        const updateJob = await window.electronTopoLayerAPI.updateBoundaryColor(id, color);
        if(updateJob.result) {
            const updatedDisplayItems = new Map(get().boundaryDisplayItems);
            const updatedBoundaries = new Map(get().fetchedBoundaries);
            const formerStatus = updatedDisplayItems.get(id);

            updatedDisplayItems.set(id, {
                displayString: formerStatus.displayString,
                checked: formerStatus.checked,
                colorIndex: color
            });

            const fetchJob = await window.electronTopoLayerAPI.selectBoundaryMetadataAll();
            if(fetchJob.result) {
                fetchJob.metadatas.forEach(boundary => {
                    updatedBoundaries.set(boundary.id, boundary);
                });

                set(() => {return {
                    boundaryDisplayItems: updatedDisplayItems,
                    fetchedBoundaries: updatedBoundaries,
                }});
            }

            return {result: true, updatedBoundary:  get().fetchedBoundaries.get(id)};
        }
        return {result: false};
    },
    fetchAllBoundaries: async() => {
        const fetchJob = await window.electronTopoLayerAPI.selectBoundaryMetadataAll();
        if(!fetchJob || !fetchJob.result) return;

        const updatedBoundaryMetadatas: Map<string, BoundaryMetadata> = new Map();
        const updatedBoundaryDisplayItems: Map<string, DisplayItemProps> = new Map();
        fetchJob.metadatas.forEach(data => {
            updatedBoundaryMetadatas.set(data.id, data);
            updatedBoundaryDisplayItems.set(data.id, {
                displayString: data.name,
                checked: false,
                colorIndex: data.colorIndex
            });
        });

        set(() => {
            return {
                fetchedBoundaries: updatedBoundaryMetadatas,
                boundaryDisplayItems: updatedBoundaryDisplayItems
            }
        })
    },
    insertBoundary: async(name: string) => {
        // Pre-check for duplication.
        const fetchMetadataJob = await window.electronTopoLayerAPI.selectBoundaryMetadataAll();
        if(!fetchMetadataJob || !fetchMetadataJob.result) return;
        
        if(fetchMetadataJob.metadatas.find(meta => meta.name === name)) {
            await window.electronSystemAPI.callDialogError("경계선 추가 오류", "해당 이름의 경계선은 이미 등록되어 있습니다. 다른 이름을 사용해 주세요.");
            return;
        }
        
        // Insert job
        const insertJob = await window.electronTopoLayerAPI.insertBoundary(name);
        if(!insertJob || !insertJob.result) return;
        
        const updatedBoundaries = new Map(get().fetchedBoundaries);
        const updatedBoundaryDisplayItems = new Map(get().boundaryDisplayItems);
        insertJob.boundaries.forEach(boundary => {
            updatedBoundaries.set(boundary.id, boundary);
            updatedBoundaryDisplayItems.set(boundary.id, {
                displayString: boundary.name,
                checked: false,
                colorIndex: boundary.colorIndex
            });

            const boundaryObject = createBoundaryObject(boundary);
            SceneController.getInstance().addObjects([boundaryObject]);
        });
        
        set(() => {
            return {
                fetchedBoundaries: updatedBoundaries,
                boundaryDisplayItems: updatedBoundaryDisplayItems
            }
        })
    },
    removeBoundaries: async(ids: string[]) => {
        const removeJob = await window.electronTopoLayerAPI.removeBoundaries(ids);
        const oldBoundaries = get().fetchedBoundaries;
        const updatedBoundaries= new Map(oldBoundaries);
        const deletedTargets: Map<string, BoundaryMetadata> = new Map();
        const newDisplayItems = new Map(get().boundaryDisplayItems);
        if(removeJob.result) {
            ids.forEach(id => {
                deletedTargets.set(id, oldBoundaries.get(id));
                newDisplayItems.delete(id);
                updatedBoundaries.delete(id);
            })

            set(() => {
                return { 
                    boundaryDisplayItems : newDisplayItems,
                    fetchedBoundaries: updatedBoundaries,
                }
            })
            return {result: removeJob.result, deletedBoundaries: Array.from(deletedTargets.values())};
        }
        
        return {result: false}
    }
}));