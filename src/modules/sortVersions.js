const pad = 3

function getLongNumber(version, totalLength = pad) {
    const splited = version.split('.')
    const mapped = splited.map((number) => number.padStart(pad, '0'))
    return +mapped.join('').padEnd(totalLength, '0')
}

function getSplitLength(version) {
    return version.split('.').length
}

function getMaxSplitLength(versions) {
    return Math.max(...versions.map(getSplitLength))
}

function sort(versions) {
    const totalLength = getMaxSplitLength(versions) * pad
    return versions.sort((a, b) => {
        return getLongNumber(a, totalLength) - getLongNumber(b, totalLength)
    })
}

function getTypeList(versions) {
    if (!versions) return 'empty'
    if (versions?.length === undefined) return 'object'
    if (!versions.length) return 'empty'
    if (typeof versions[0] === 'string') return 'string'
    if (versions[0]?.version) return 'array'
}

function getTagVersions(versions, typeList = 'empty') {
    if (typeList == 'empty') return []
    if (typeList == 'string') return versions
    if (typeList == 'object') return Object.keys(versions)
    if (typeList == 'array') return versions.map(version => version.version)
}

function formatNewList(versions, typeList = 'empty', sortedTags) {
    if (typeList == 'empty') return []
    if (typeList == 'string') return sortedTags
    if (typeList == 'object') return sortedTags.map(tag => versions[tag])
    if (typeList == 'array') {
        return sortedTags.map(tag => {
            const index = versions.findIndex(({ version }) => version == tag)
            return versions[index]
        })
    }
}

function sortVersions(versions) {
    const typeList = getTypeList(versions)
    const tagVersions = getTagVersions(versions, typeList)
    const sorted = sort(tagVersions)
    return formatNewList(versions, typeList, sorted)
}

export default sortVersions