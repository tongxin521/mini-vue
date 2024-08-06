// packages/reactivity/src/effect.ts
var activeEffect;
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
function preClearEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postClearEffect(effect2) {
  for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
    const dep = effect2.deps[i];
    if (dep) {
      cleanDepEffect(effect2, dep);
    }
  }
}
function cleanDepEffect(effect2, dep) {
  dep.delete(effect2);
  if (dep.size === 0) {
    dep.cleanup();
  }
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this._trackId = 0;
    this._depsLength = 0;
    // 记录当前 effect 是否正在运行(解决effect 无限循环调用)
    this._running = 0;
    // 记录当前 effect 依赖的响应式数据
    this.deps = [];
    this._dirtyLevel = 4 /* Dirty */;
  }
  run() {
    this._dirtyLevel = 0 /* NotDirty */;
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preClearEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postClearEffect(this);
      activeEffect = lastEffect;
    }
  }
  get dirty() {
    return this._dirtyLevel >= 4 /* Dirty */;
  }
  set dirty(val) {
    this._dirtyLevel = val ? 4 /* Dirty */ : 0 /* NotDirty */;
  }
};
function trackEffect(effect2, dep) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(effect2, oldDep);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
  }
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2._dirtyLevel < 4 /* Dirty */) {
      effect2._dirtyLevel = 4 /* Dirty */;
    }
    if (!effect2._running) {
      effect2.scheduler?.();
    }
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/reactiveEffect.ts
var tagrgetMap = /* @__PURE__ */ new WeakMap();
function createDeps(cleanup, key) {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.name = key;
  return dep;
}
function track(target, key) {
  if (activeEffect) {
    let depsMap = tagrgetMap.get(target);
    if (!depsMap) {
      tagrgetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(
        key,
        dep = createDeps(() => depsMap.delete(key), key)
      );
    }
    trackEffect(activeEffect, dep);
  }
}
function trigger(target, key, value, oldValue) {
  const depMap = tagrgetMap.get(target);
  if (!depMap) {
    return;
  }
  const dep = depMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}

// packages/reactivity/src/baseHandlers.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    const res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  return createReactiveObject(target);
}
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const existProxy = reactiveMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
function isReactive(value) {
  return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    this._value = newVal;
    triggerRefValue(this);
  }
};
function trackRefValue(ref2) {
  if (activeEffect) {
    trackEffect(activeEffect, ref2.dep = createDeps(() => ref2.dep = void 0, "undefined"));
  }
}
function triggerRefValue(ref2) {
  if (ref2.dep) {
    triggerEffects(ref2.dep);
  }
}
function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
function toRefs(object) {
  const ret = {};
  for (let key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
var ObjectRefImpl = class {
  constructor(_object, _key) {
    this._object = _object;
    this._key = _key;
    this.__v_isRef = true;
  }
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
};
function proxyRefs(object) {
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
    }
  });
}
function isRef(value) {
  return value.__v_isRef;
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, _setter) {
    this._setter = _setter;
    this.__v_isReadonly = true;
    this.__v_isRef = true;
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
};
function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/reactivity/src/apiWatch.ts
function watch(source, cb, options = {}) {
  return doWatch(source, cb, options);
}
function watchEffect(effect2, options = {}) {
  return doWatch(effect2, void 0, options);
}
function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = () => traverse(source, deep === false ? 1 : void 0);
  let getter;
  let oldValue;
  if (isReactive(source)) {
    getter = reactiveGetter;
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isFunction(source)) {
    getter = source;
  }
  const job = () => {
    if (cb) {
      const newValue = effect2.run();
      cb(newValue, oldValue);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else {
    effect2.run();
  }
}
function traverse(source, depth = Infinity, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(source) || depth <= 0) {
    return source;
  }
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
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  isReactive,
  isRef,
  proxyRefs,
  reactive,
  ref,
  toReactive,
  toRef,
  toRefs,
  trackEffect,
  trackRefValue,
  triggerEffects,
  triggerRefValue,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
