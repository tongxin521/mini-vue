import { isObject } from "@vue/shared";
import { ReactiveFlags, mutableHandlers } from "./baseHandlers";

const reactiveMap = new WeakMap();



export function reactive(target) {
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

    const proxy = new Proxy(target, mutableHandlers);

    reactiveMap.set(target, proxy);


    return proxy;
}