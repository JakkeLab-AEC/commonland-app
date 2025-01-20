export interface IElectronIPCSystemAPI {
    receiveOSInfo: (callback) => void;
    callDialogError: (title:string, message: string) => Promise<void>;
}

declare global {
    interface Window {
        electronSystemAPI: IElectronIPCSystemAPI;
    }
}