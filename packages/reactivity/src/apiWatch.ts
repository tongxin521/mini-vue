import { isFunction, isObject } from "@vue/shared"
import { isReactive } from "./reactive";
import { isRef } from './ref';
import { ReactiveEffect } from "./effect";

export function watch(source, cb, options = {} as any) {
    return doWatch(source, cb, options)
}

export function watchEffect(effect, options = {} as any) {
    return doWatch(effect, undefined, options)
}

function doWatch(source, cb, {deep, immediate}) {
    const reactiveGetter = () => traverse(source, deep === false ? 1 : undefined);
    let getter;
    let oldValue;
    if (isReactive(source)) {
        getter = reactiveGetter;
    } else if(isRef(source)) {
        getter = () => source.value;
    } else if (isFunction(source)) {
        getter = source;
    }

    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter(), deep === false ? 1 : undefined);
    }
    let clean
    const  onCleanup = (fn) => {
        clean = () => {
            fn();
            clean = void 0;
        }
    }
    const job = () => {
        if (cb) {
            const newValue = effect.run();
            if (clean) {
                clean();
            }
            cb(newValue, oldValue, onCleanup);
            oldValue = newValue;
        }else {
            effect.run();
        }
    }
    const effect = new ReactiveEffect(getter, job);

    if (cb) {
        if (immediate) {
            job();
        } else {
            oldValue = effect.run();
        }
        
    } else {
        effect.run();
    }

    const unWatch = () => {
        effect.stop();
    }

    return unWatch;
    
}


function traverse(source, depth = Infinity, seen = new Set()) {
    if (!isObject(source) || depth <= 0) {
        return source;
    }
    // 防止无限递归
    if (seen.has(source)) {
        return source;
    }

    seen.add(source);
    depth--;
    for (const key in source) {
        traverse(source[key], depth, seen);
    }
    return source;
}