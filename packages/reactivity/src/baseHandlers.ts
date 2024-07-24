import { track } from "./reactiveEffect";

export enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
}

export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        track(target, key);
        return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    },
}