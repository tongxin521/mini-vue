import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

class ComputedRefImpl {

    public readonly __v_isReadonly = true;
    public readonly __v_isRef = true;
    public dep;
    public readonly effect;
    private _value;
    constructor(getter, public _setter) {
        this.effect = new ReactiveEffect(() => getter(this._value), () => {
            triggerRefValue(this);
        });
        
    }

    get value() {
        if (this.effect.dirty) {
            this._value = this.effect.run();
            trackRefValue(this);
        }
        
        return this._value;
    }

    set value(newValue) {
        this._setter(newValue);
    }
}

export function computed(getterOrOptions) {
    const onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => {};
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }

    return new ComputedRefImpl(getter, setter)
}