export function pathStyle(el, next, prev) {
    const style = el.style
    if (!next) {
        el.removeAttribute('style')
    } else {
        if (prev) {
            for (const key in prev) {
                style[key] = ''
            }
        }
        for (const key in next) {
            style[key] = next[key]
        }
    }
}