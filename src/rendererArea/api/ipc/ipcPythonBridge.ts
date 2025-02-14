import { PipeMessageSend, PipeMessageSendRenderer } from "@/dto/pipeMessage";

export interface IElectronIPCPythonBridge {
    test:() => Promise<void>;
    start:() => Promise<void>;
    stop:() => Promise<void>;
    send:(message: PipeMessageSendRenderer) => Promise<void>;
}

declare global {
    interface Window {
        electronIPCPythonBridge: IElectronIPCPythonBridge
    }
}