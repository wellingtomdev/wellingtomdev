function getOnlyNumbers(string) {
    return string.replace(/\D/g, '')
}

function getAtualizedNumberInGooleSheet(number) {
    if (number.indexOf(':::') == -1) return number
    const splitedNumber = number.split(':::')
    return splitedNumber[splitedNumber.length - 1]
}

function getFirstsNumbers(number, length) {
    return number.slice(0, length)
}

function normalizeNumber(number, numberValidation = true) {
    if (!number) return ''
    if (typeof number !== 'string') number = number.toString()
    number = getAtualizedNumberInGooleSheet(number)
    number = getOnlyNumbers(number)
    if (!numberValidation) return number
    if (getFirstsNumbers(number, 2) === '55') { number = number.slice(2) }
    if (getFirstsNumbers(number, 2) === '15' && number.length > 11) { number = number.slice(2) }
    else if (getFirstsNumbers(number, 3) === '015' && number.length > 12) { number = number.slice(3) }
    if (getFirstsNumbers(number, 1) === '0') { number = number.slice(1) }
    if (number.length > 11) return number
    return `55${number}`
}

export default normalizeNumber