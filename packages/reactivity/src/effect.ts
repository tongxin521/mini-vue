import { DirtyLevels } from "./constants";

// 当前正在运行的 effect
export let activeEffect;
// 创建 effect， 并执行 effect，
export function effect(fn, options) {
    // 创建 effect
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    });
    // 执行 effect
    _effect.run();

    if (options) {
        Object.assign(_effect, options);
    }

    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

function preClearEffect(effect) {
    effect._trackId ++;
    effect._depsLength = 0;
}

function postClearEffect(effect) {
    for (let i = effect._depsLength; i< effect.deps.length; i++) {
        const dep = effect.deps[i];
        if (dep) {
            cleanDepEffect(effect, dep);
        }
    }
}

function cleanDepEffect(effect, dep) {
    dep.delete(effect);
    if (dep.size === 0) {
        dep.cleanup();
    }
}
export class ReactiveEffect {
    active = true;
    _trackId = 0;
    _depsLength = 0;
    // 记录当前 effect 是否正在运行(解决effect 无限循环调用)
    _running = 0;
    // 记录当前 effect 依赖的响应式数据
    deps = [];

    _dirtyLevel = DirtyLevels.Dirty
    constructor(public fn, public scheduler) {
    }

    run() {
        this._dirtyLevel = DirtyLevels.NotDirty;
        if (!this.active) {
            return this.fn();
        }
        let lastEffect = activeEffect;
        try {
            activeEffect = this;
            preClearEffect(this);
            this._running++;
            return this.fn();
        }
        finally {
            this._running--;
            postClearEffect(this);
            activeEffect = lastEffect; 
        }
        
    }

    stop() {
        if (this.active) {
            preClearEffect(this);
            postClearEffect(this);
            this.active = false;
        }
    }

    get dirty() {
        return this._dirtyLevel >= DirtyLevels.Dirty;
    }

    set dirty(val) {
        this._dirtyLevel = val ? DirtyLevels.Dirty : DirtyLevels.NotDirty;
    }
}

// 收集依赖
export function trackEffect(effect, dep) {
    if (dep.get(effect) !== effect._trackId) {
        dep.set(effect, effect._trackId)
        const oldDep = effect.deps[effect._depsLength]
        if (oldDep !== dep) {
            if (oldDep) {
                cleanDepEffect(effect, oldDep)
            }
            
            effect.deps[effect._depsLength++] = dep;
        } else {
            effect._depsLength++;
        }
        
    }
}

// 触发依赖
export function triggerEffects(dep) {
    for (const effect of dep.keys()) {

        if (effect._dirtyLevel < DirtyLevels.Dirty) {
            effect._dirtyLevel = DirtyLevels.Dirty;
        }

        if (!effect._running) {
            effect.scheduler?.();
        }
    }
}