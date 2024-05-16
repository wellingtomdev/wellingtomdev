import client from './client'
import server from './server'

export default {
    server,
    client,
    createClient: client.createClient,
    createServer: server.createServer,
    getSocketServer: server.getSocketServer,
}