export * from '@vue/reactivity';

export function createRenderer(renderOptions) {
    const render = (vnode, container) => {}
    return {
        render
    }
}