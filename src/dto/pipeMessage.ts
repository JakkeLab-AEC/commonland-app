export interface PipeMessageSendRenderer {
    action: string,
    args: any
}

export interface PipeMessageReceived {
    result: boolean,
    message: string
}