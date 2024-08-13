export function isObject (value) {
    return typeof value === 'object' && value !== null;
}

export function isFunction(value){
    return typeof value === 'function';
}

export const extend = Object.assign;

export function isString(value) {
    return typeof value === 'string';
}

export const isOn = key =>
    key.charCodeAt(0) === 111 /* o */ &&
    key.charCodeAt(1) === 110 /* n */ &&
    // uppercase letter
    (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97)