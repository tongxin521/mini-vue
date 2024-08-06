import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDeps } from "./reactiveEffect";

export function ref(value) {
    return createRef(value);
}

function createRef(value) {
    return new RefImpl(value);
}


class RefImpl {
    public readonly __v_isRef = true;
    private _value;
    dep
    constructor(public rawValue) {
        this._value = toReactive(rawValue);
    }

    get value() {
        trackRefValue(this)
        return this._value;
    }

    set value(newVal) {
        this._value = newVal;
        triggerRefValue(this);
    }
}

export function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect(activeEffect, (ref.dep = createDeps(() => ref.dep = void 0, 'undefined')))
    }
}


export function triggerRefValue(ref) {
    if (ref.dep) {
        triggerEffects(ref.dep);
    }
}


export function toRef(object, key) {
    return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
    const ret = {};
    for (let key in object) {
        ret[key] = toRef(object, key);
    }

    return ret;
}

class ObjectRefImpl {
    public readonly __v_isRef = true;
    constructor(public _object, public _key) {
    }

    get value() {
        return this._object[this._key];
    }

    set value(newVal) {
        this._object[this._key] = newVal;
    }
}


export function proxyRefs(object) {
    return new Proxy(object, {
        get(target, key, receiver) {
            const r = Reflect.get(target, key, receiver);
            return r.__v_isRef ? r.value : r;
        },

        set(target, key, value, receiver) {
            const oldValue = target[key];
            if (oldValue.__v_isRef) {
                oldValue.value = value;
                return true;
            } else {
                return Reflect.set(target, key, value, receiver);
            }
        },
    });
}


export function isRef(value) {
    return value.__v_isRef;
}