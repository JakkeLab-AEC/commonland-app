export interface PipeMessageSend {
    action: string,
    args: any
}

export interface PipeMessageReceived {
    result: boolean,
    message: string
}