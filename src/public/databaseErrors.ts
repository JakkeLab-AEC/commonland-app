export type DBError = {code: number, name: string, message: string}

export const DB_ERRORCODE:{[key: string]:{code: number, name: string, message: string}} = {
    internalError: {
        code: 11,
        name: 'InternalError',
        message: 'Internal Error, please report the issue.'
    },
    nameDuplication: {
        code: 12,
        name: 'BoringNameDuplication',
        message: 'This name already used for another boring.'
    },
}