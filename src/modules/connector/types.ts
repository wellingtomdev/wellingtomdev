
export type Request = {
    resolve: Function,
    reject: Function,
    requestValue: EmitRequestValues,
    received: boolean,
}

export type ServerEmitProcedure = {
    id: string,
    originId: string,
    call: string,
    args: Array<any>,
}

export type ServerEmitResponse = {
    id: string,
    originId?: string,
    response: any,
    success: boolean,
    error: any,
}

export type ClientEmitProcedure = {
    id: string,
    targetName: string,
    call: string,
    args: Array<any>,
}

export type ClientEmitResponse = {
    id: string,
    originId: string,
    response: any,
    success: boolean,
    error: any,
}

export type ConnectionInServer<SocketType> = {
    id: string,
    socket: SocketType,
    config?: {
        name?: string
        methods?: Array<string>
        states?: { [key: string]: any }
        isMultiple?: boolean
    },
}

export type SetupValues = {
    name: string,
    methods: string[],
    states: {
        [key: string]: any
    },
    listeners: string[]
}

export type ServerOptionsT = {
    rules?: {
        [name: string]: {
            allowMultiple?: boolean,
        }
    }
}

export type EmitRequestValues = ClientEmitProcedure | ClientEmitResponse

export type StateT = {
    tagData: string,
    value: any
}