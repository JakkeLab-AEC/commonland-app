export interface PipeMessageSend {
    action: string,
    runtimePath: string,
    args: any
}

export interface PipeMessageSendRenderer {
    action: string,
    args: any
}

export interface PipeMessageReceived {
    result: boolean,
    message: string
}