import { contextBridge, ipcRenderer } from "electron";
import { BoringDTO } from "./dto/serviceModel/BoringDTO";
import { TopoDTO } from "./dto/serviceModel/topoDto";
import { PipeMessageSendRenderer } from "./dto/pipeMessage";
import { OBBDto } from "./mainArea/models/graphics/obb";
import { LandInfoModifyOption } from "./mainArea/repository/landInfoRepository";
import { LandInfoDTO } from "./dto/serviceModel/landInfo";

contextBridge.exposeInMainWorld('electronWindowControlAPI', {
    minimize: () => ipcRenderer.invoke('window-control-minimize'),
    maximize: () => ipcRenderer.invoke('window-control-maximize'),
    quit: () => ipcRenderer.invoke('window-control-quit'),
})

contextBridge.exposeInMainWorld('electronBoringDataAPI', {
    insertBoring: (boringDto: BoringDTO) => ipcRenderer.invoke('boring-repository-insert', boringDto),
    fetchAllBorings: () => ipcRenderer.invoke('boring-repository-fetch-all'),
    updateBoring: (boringDto: BoringDTO) => ipcRenderer.invoke('boring-repository-update', boringDto),
    updateBorings: (boringDtos: BoringDTO[]) => ipcRenderer.invoke('boring-repository-update-multiple', boringDtos),
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
    newProject: () => ipcRenderer.invoke('project-file-new'),
})

contextBridge.exposeInMainWorld('electronTopoLayerAPI', {
    // Topos
    insertTopo: (topoDto: TopoDTO, obb?: OBBDto) => ipcRenderer.invoke('topolayer-insert', topoDto, obb),
    fetchAllTopos: () => ipcRenderer.invoke('topolayer-fetch-all'),
    fetchAllTopoMetadatas: () => ipcRenderer.invoke('topolayer-fetch-metadata-all'),
    updateTopoColor: (id:string, index: number) => ipcRenderer.invoke('topolayer-update-color', id, index),
    updateTopoThreeObjId: (ids: {id: string, threeObjId: string}[]) => ipcRenderer.invoke('topolayer-update-threeobjid', ids),
    removeTopos: (ids: string[]) => ipcRenderer.invoke('topolayer-remove', ids),
    
    // Boundaries
    insertBoundary: (name: string) => ipcRenderer.invoke('boundary-add', name),
    removeBoundaries: (ids: string[]) => ipcRenderer.invoke('boundary-remove', ids),
    selectBoundaryMetadata: (id: string) => ipcRenderer.invoke('boundary-fetch-metadata-by-id', id),
    selectBoundaryMetadataAll: () => ipcRenderer.invoke('boundary-fetch-metadata-all'),
    selectBoundary: (id: string) => ipcRenderer.invoke('boundary-fetch-by-id', id),
    selectBoundaryAll: () => ipcRenderer.invoke('boundary-fetch-all'),
    updateBoundaryColor: (id: string, index: number) => ipcRenderer.invoke('boundary-update-color', id, index),
});

contextBridge.exposeInMainWorld('electronSystemAPI', {
    receiveOSInfo: (callback) => ipcRenderer.on('os-info', (_event, osInfo) => callback(osInfo)),
    callDialogError: (title: string, message: string) => ipcRenderer.invoke('call-dialog-error', title, message),
});

contextBridge.exposeInMainWorld('electronIPCPythonBridge', {
    test:() => ipcRenderer.invoke('test-python-pipe'),
    start:() => ipcRenderer.invoke('start-python-loop'),
    stop:() => ipcRenderer.invoke('stop-python-loop'),
    send:(message: PipeMessageSendRenderer) => ipcRenderer.invoke('send-message', message),
});

contextBridge.exposeInMainWorld('electronLandInfoAPI', {
    fetchLandInfo: () => ipcRenderer.invoke('landinfo-fetch'),
    updateLandInfo: (option: LandInfoModifyOption) => ipcRenderer.invoke('landinfo-update', option),
    registerLandInfo: (info: LandInfoDTO) => ipcRenderer.invoke('landinfo-register', info),
});