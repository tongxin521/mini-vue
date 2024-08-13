export function pathClass(el, value, isSvg) {
    if (!value) {
        el.removeAttribute('class');
    }
    else if (isSvg) {
        el.setAttribute('class', value)
    }
    else {
        el.calssName = value;
    }
}