export interface IElectronIPCBoringData {
    saveProject: () => Promise<{result: boolean, message?: string}>,
    openProject: () => Promise<{result: boolean, message?: string}>,
    newProject: () => Promise<{result: boolean, message?: string}>,
}

declare global {
    interface Window {
        electronProjectIOAPI: IElectronIPCBoringData;
    }
}