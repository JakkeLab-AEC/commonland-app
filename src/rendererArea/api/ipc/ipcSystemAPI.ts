export interface IElectronIPCSystemAPI {
    receiveOSInfo: (callback) => void;
}

declare global {
    interface Window {
        electronSystemAPI: IElectronIPCSystemAPI;
    }
}