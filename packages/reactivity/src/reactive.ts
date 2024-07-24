import { isObject } from "@vue/shared";

const reactiveMap = new WeakMap();

enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
}

export function reactive(target) {
    return createReactiveObject(target);
}

const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    },
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