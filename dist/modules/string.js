"use strict";
function removeAccents(str) {
    if (typeof str !== 'string')
        str = String(str);
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function onlyLetters(str) {
    return str.replace(/[^a-zA-Z]/g, '');
}
function onlyLettersAndNumbersAndUnderscore(str) {
    return str.replace(/[^a-zA-Z0-9_]/g, '');
}
function upperCase(str) {
    return str.toUpperCase();
}
function lowerCase(str) {
    return str.toLowerCase();
}
function sanitizeName(...str) {
    const completeString = str.map(s => s.trim()).join('');
    return lowerCase(onlyLettersAndNumbersAndUnderscore(removeAccents(completeString)));
}
module.exports = {
    removeAccents,
    onlyLetters,
    onlyLettersAndNumbersAndUnderscore,
    upperCase,
    sanitizeName,
};
//# sourceMappingURL=string.js.map