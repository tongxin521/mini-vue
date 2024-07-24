let activeEffect;
export function effect(fn) {
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    });

    _effect.run();
}


class ReactiveEffect {
    active = true;
    constructor(public fn, public scheduler) {
    }

    run() {
        if (!this.active) {
            return this.fn();
        }

        let lastEffect = activeEffect;

        try {
            activeEffect = this;
            return this.fn();
        }
        finally {
            activeEffect = lastEffect; 
        }
        
    }
}