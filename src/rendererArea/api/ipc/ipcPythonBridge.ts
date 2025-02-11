export interface IElectronIPCPythonBridge {
    test:() => Promise<void>
}

declare global {
    interface Window {
        electronIPCPythonBridge: IElectronIPCPythonBridge
    }
}