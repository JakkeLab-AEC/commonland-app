export interface IElectronIPCWindowControl {
    minimize: () => void;
    maximize: () => void;
    quit: () => void;
}

declare global {
    interface Window {
        electronWindowControlAPI: IElectronIPCWindowControl;
    }
}