import { Socket } from "socket.io"
import { ConnectionInServer } from "../types"

const connections: { [key: string]: ConnectionInServer<Socket> } = {}

export function setConnection(connection: ConnectionInServer<Socket>) {
    const id = connection.id
    connections[id] = connection
}

export function deleteConnection(id: string) {
    delete connections[id]
}

export function getConnectionById(id: string) {
    return connections[id]
}

export function getConnectionByName(name: string) {
    return Object.values(connections).filter(connection => connection?.config?.name === name)
}

export default {
    setConnection,
    deleteConnection,
    getConnectionById,
    getConnectionByName
}