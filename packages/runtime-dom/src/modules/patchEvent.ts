const veiKey = Symbol('_vei')

export function patchEvent(el, rawName, prevValue, nextValue) {

    const invokers = el[veiKey] || (el[veiKey] = {})
    const existingInvoker = invokers[rawName]

    if (nextValue && existingInvoker) {
        existingInvoker.value = nextValue
    }
    else {
        const eventName = rawName.slice(2).toLowerCase()
        if (nextValue) {
            const invoker = createInvoker(nextValue)
            invokers[rawName] = invoker
            el.addEventListener(eventName, invoker)
            el[veiKey] = invokers
        }
        else {
            el.removeEventListener(eventName, existingInvoker.value);
            invokers[rawName] = undefined
        }
    }
}

function createInvoker(initialValue) {
    const invoker = (e) => {
        invoker.value(e)
    }

    invoker.value = initialValue
    return invoker
}