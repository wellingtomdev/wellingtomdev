const pad = 3

export type VersionTag = string
export type VersionEmpty = undefined | null | false | 0 | ''
export type VersionStringArray = VersionTag[]
export type VersionObjectArray = { version: VersionTag }[]
export type VersionObject = { [key: VersionTag]: any }
export type VersionsList = VersionStringArray | VersionObjectArray | VersionObject | VersionEmpty


export function getLongNumber(version: VersionTag, totalLength = pad) {
    const splited = version.split('.')
    const mapped = splited.map((number) => number.padStart(pad, '0'))
    return +mapped.join('').padEnd(totalLength, '0')
}

export function getSplitLength(version: VersionTag) {
    return version.split('.').length
}

export function getMaxSplitLength(versions: VersionTag[]) {
    return Math.max(...versions.map(getSplitLength))
}

export function sort(versions: VersionTag[]) {
    const totalLength = getMaxSplitLength(versions) * pad
    return versions.sort((a, b) => {
        return getLongNumber(a, totalLength) - getLongNumber(b, totalLength)
    })
}

export function getTypeList(versions: VersionsList) {
    if (!versions) return 'empty'
    if (versions?.length === undefined) {
        const keys = Object.keys(versions)
        if (keys.length) return 'object'
        return 'empty'
    }
    if (!versions.length) return 'empty'
    if (!Array.isArray(versions)) return 'empty'
    if (typeof versions[0] === 'string') return 'string'
    if (versions[0]?.version) return 'array'
}

export function getTagVersions(versions: VersionsList, typeList = 'empty') {
    if (typeList == 'empty') return []
    if (typeList == 'string') return versions
    if (typeList == 'object') return Object.keys(versions || {})
    if (typeList == 'array') return (versions || []).map((version: { version: VersionTag }) => version.version)
}

export function formatNewList(versions: VersionsList, typeList = 'empty', sortedTags: VersionTag[]): VersionStringArray | VersionObjectArray {
    if (typeList == 'empty') return []
    if (typeList == 'string') return sortedTags
    if (typeList == 'object') {
        const _versions = versions as VersionObject
        return sortedTags.map((tag: VersionTag) => _versions[tag])
    }
    if (typeList == 'array') {
        const _versions = versions as VersionObjectArray
        return sortedTags.map(tag => {
            const index = _versions.findIndex(({ version }) => version == tag)
            return _versions[index]
        })
    }
    return []
}

export function sortVersions(versions: VersionsList[]) {
    const typeList = getTypeList(versions)
    const tagVersions = getTagVersions(versions, typeList)
    const sorted = sort(tagVersions)
    return formatNewList(versions, typeList, sorted)
}

export default sortVersions