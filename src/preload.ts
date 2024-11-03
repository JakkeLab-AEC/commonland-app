import { contextBridge, ipcRenderer } from "electron";
import { BoringDTO } from "./dto/serviceModel/BoringDTO";
import { TopoDTO } from "./dto/serviceModel/topoDto";

contextBridge.exposeInMainWorld('electronWindowControlAPI', {
    createNewWindow: () => ipcRenderer.invoke('window-control-new-window'),
})

contextBridge.exposeInMainWorld('electronBoringDataAPI', {
    insertBoring: (boringDto: BoringDTO) => ipcRenderer.invoke('boring-repository-insert', boringDto),
    fetchAllBorings: () => ipcRenderer.invoke('boring-repository-fetch-all'),
    updateBoring: (boringDto: BoringDTO) => ipcRenderer.invoke('boring-repository-update', boringDto),
    updateBoringBatch:(idAndOptions: {id: string, option: boolean}[]) => ipcRenderer.invoke('boring-repository-update-batch', idAndOptions),
    searchBoringNamePattern: (prefix: string, index:number) => ipcRenderer.invoke('boring-repository-search-name-pattern', prefix, index),
    searchBoringName: (name: string, id?: string) => ipcRenderer.invoke('boring-repository-search-name-exact', name, id),
    removeBoring: (ids: string[]) => ipcRenderer.invoke('boring-repository-remove', ids),
    getAllLayerColors: () => ipcRenderer.invoke('boring-repository-layer-colors-fetchall'),
    updateLayerColor: (layerName: string, colorIndex: number) => ipcRenderer.invoke('boring-repository-layer-colors-update', layerName, colorIndex),
})

contextBridge.exposeInMainWorld('electronProjectIOAPI', {
    saveProject: () => ipcRenderer.invoke('project-file-save'),
    openProject: () => ipcRenderer.invoke('project-file-read'),
})

contextBridge.exposeInMainWorld('electronTopoLayerAPI', {
    insertTopo: (topoDto: TopoDTO) => ipcRenderer.invoke('topolayer-insert', topoDto),
    fetchAllTopos: () => ipcRenderer.invoke('topolayer-fetch-all'),
    updateTopoColor: (id:string, index: number) => ipcRenderer.invoke('topolayer-update-color', id, index),
    updateTopoThreeObjId: (ids: {id: string, threeObjId: string}[]) => ipcRenderer.invoke('topolayer-update-threeobjid', ids),
    removeTopos: (ids: string[]) => ipcRenderer.invoke('topolayer-remove', ids),
});