
const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function onlyNumbers(dateString = '') {
    return dateString.replace(/\D/g, '')
}

function joinValue(message, value){
    return `${message}${value ? ` ${value}` : ''}`
}

const errors = {
    invalidDay: day => ({
        status: 400,
        message: joinValue('Invalid day', day),
        humanMessage: joinValue('Dia inválido -', day),
    }),
    invalidMonth: mounth => ({
        status: 400,
        message: joinValue('Invalid month', mounth),
        humanMessage: joinValue('Mês inválido -', mounth),
    }),
    invalidYear: year => ({
        status: 400,
        message: joinValue('Invalid year', year),
        humanMessage: joinValue('Ano inválido -', year),
    }),
    invalidDate: date => ({
        status: 400,
        message: joinValue('Invalid date', date),
        humanMessage: joinValue('Data inválida -', date),
    }),
}

function validDay(day = '', month) {
    const sanitizedDay = onlyNumbers(day)
    if (!sanitizedDay?.length) return ''
    const dayNumber = Number(sanitizedDay)
    if (!month) {
        if (dayNumber > 31) throw errors.invalidDay(day)
        return day.padStart(2, '0')
    }
    const sanitizedMonth = onlyNumbers(month)
    const monthNumber = Number(sanitizedMonth)
    if (monthNumber > 12) throw errors.invalidMonth(month)
    const maxDay = days[monthNumber - 1]
    if (dayNumber > maxDay) throw errors.invalidDay(day)
    return day
}

function normalizeYear(year) {
    const sanitizedYear = onlyNumbers(year)
    if (!sanitizedYear?.length) return ''
    if(sanitizedYear.length == 3 || sanitizedYear.length > 4 ) throw errors.invalidYear(year)
    if (sanitizedYear.length === 4) {
        const currentYear = new Date().getFullYear()
        const invalid = sanitizedYear > currentYear || sanitizedYear <= 1899
        if(invalid) throw errors.invalidYear(year)
        return sanitizedYear
    }
    const currentYear = new Date().getFullYear()
    const lastTwoDigits = currentYear.toString().slice(2)
    if (sanitizedYear.length === 2 && sanitizedYear > lastTwoDigits) return `19${sanitizedYear.padStart(2, '0')}`
    return `20${sanitizedYear.padStart(2, '0')}`
}

function normalizeDayOrMonth(dayOrMonth) {
    const sanitizedDayOrMonth = onlyNumbers(dayOrMonth)
    if(!sanitizedDayOrMonth?.length) throw errors.invalidDate(dayOrMonth)
    if(sanitizedDayOrMonth?.length > 2) throw errors.invalidDate(dayOrMonth)
    return sanitizedDayOrMonth.padStart(2, '0')
}

function normalizeString(dateString = '', validate = true) {
    if (!dateString?.length) return ''
    const [day, month, year] = dateString.split('/').map(onlyNumbers)
    const normalizedDay = normalizeDayOrMonth(validate ? validDay(day, month) : day)
    const normalizedMonth = normalizeDayOrMonth(validate ? validDay(month) : month)
    const normalizedYear = normalizeYear(year)
    const newValues = [normalizedDay, normalizedMonth, normalizedYear]
    return newValues.filter(value => value).join('/')
}

function getToday(includeYear = true) {
    const now = new Date()
    const day = now.getDate()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const stringYear = includeYear ? `/${year}` : ''
    const today = `${day}/${month}${stringYear}`
    return normalizeString(today, false)
}

module.exports = {
    onlyNumbers,
    normalizeString,
    normalizeYear,
    normalizeDayOrMonth,
    getToday,
}