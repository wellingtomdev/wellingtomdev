import _getAvailablePort from './modules/getAvailablePort'
import _createNotifier from './modules/createNotifier'
import _sortVersions, { getLatestVersion as _getLatestVersion } from './modules/sortVersions'
import _getObjectId from './modules/getObjectId'
import _createQueue from './modules/createQueue'
import _connector from './modules/connector'
import _random from './modules/random'
import _delay from './modules/delay'
import _json from './modules/json'

const modules = {
    getAvailablePort: _getAvailablePort,
    createNotifier: _createNotifier,
    getLatestVersion: _getLatestVersion,
    sortVersions: _sortVersions,
    getObjectId: _getObjectId,
    createQueue: _createQueue,
    connector: _connector,
    random: _random,
    delay: _delay,
    json: _json
}

export const getAvailablePort = _getAvailablePort
export const createNotifier = _createNotifier
export const sortVersions = _sortVersions
export const getLatestVersion = _getLatestVersion
export const getObjectId = _getObjectId
export const createQueue = _createQueue
export const connector = _connector
export const random = _random
export const delay = _delay
export const json = _json

export default modules