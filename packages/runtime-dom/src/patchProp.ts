import { isOn } from "@vue/shared"
import { pathClass } from "./modules/pathClass"
import { pathStyle } from "./modules/pathStyle"
import { patchEvent } from "./modules/patchEvent"
import { patchAttr } from "./modules/patchAttr"

export const patchProp = (
    el,
    key,
    prevValue,
    nextValue,
    namespace,
    parentComponent,
) => {
    const isSVG = namespace === 'svg'
    if (key === 'class') {
        pathClass(el, nextValue, isSVG)
    }
    else if (key === 'style') {
        pathStyle(el, nextValue, prevValue)
    }
    else if (isOn(key)) {
        patchEvent(el, key, prevValue, nextValue)
    }
    else {
        patchAttr(el, key, nextValue)
    }
}