import { ServerOptionsT } from "../types"

const allServerOptions: { [port: number]: ServerOptionsT } = {}

export function setServerOptions(serverPort: number, options: ServerOptionsT) {
    allServerOptions[serverPort] = options
}

export function getServerOptions(serverPort: number): ServerOptionsT {
    return allServerOptions[serverPort] || {}
}