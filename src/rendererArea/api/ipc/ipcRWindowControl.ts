export interface IElectronIPCWindowControl {
    createNewWindow: () => Promise<{result: boolean, message?: string}>;
}

declare global {
    interface Window {
        electronWindowControlAPI: IElectronIPCWindowControl;
    }
}