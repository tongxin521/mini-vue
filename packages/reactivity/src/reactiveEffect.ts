import { activeEffect, trackEffect, triggerEffects } from "./effect";

// 记录依赖
const tagrgetMap = new WeakMap();

export function createDeps(cleanup, key) {
    const dep = new Map() as any;
    dep.cleanup = cleanup;
    dep.name = key;
    return dep;
}

// 收集依赖
export function track(target, key) {
    if (activeEffect) {
        let depsMap = tagrgetMap.get(target);

        if (!depsMap) {
            tagrgetMap.set(target, (depsMap = new Map()));
        }

        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(
                key,
                (dep = createDeps(() => depsMap.delete(key), key))
            );
        }

        trackEffect(activeEffect, dep);
    }
}

// 触发依赖
export function trigger(target, key, value, oldValue) {
    const depMap = tagrgetMap.get(target);
    if (!depMap) {
        return;
    }

    const dep = depMap.get(key);

    if (dep) {
        triggerEffects(dep)
    }

}
