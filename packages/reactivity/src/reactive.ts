import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";
import { ReactiveFlags } from "./constants";

// 缓存 reactive 代理对象
const reactiveMap = new WeakMap();



export function reactive(target) {
    // 创建 代理对象
    return createReactiveObject(target);
}



function createReactiveObject(target) {
    if (!isObject(target)) {
        return target;
    }
    // 判断target已经是代理对象
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }

    // 判断是否已经存在代理对象
    const existProxy = reactiveMap.get(target);
    // 存在则直接返回
    if (existProxy) {
        return existProxy;
    }
    // 创建代理对象
    const proxy = new Proxy(target, mutableHandlers);
    // 缓存代理对象
    reactiveMap.set(target, proxy);

    return proxy;
}

export function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
}


export function isReactive(value) {
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

