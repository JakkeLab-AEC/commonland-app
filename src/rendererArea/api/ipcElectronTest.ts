export interface IPCElectronTest {
    sendMessage: () => Promise<string>;
}

declare global {
    interface Window {
        electronIPCElectronTest: IPCElectronTest
    }
}