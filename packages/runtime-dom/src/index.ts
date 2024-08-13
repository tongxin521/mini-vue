import { extend } from "@vue/shared";
import { patchProp } from "./patchProp";
import { nodeOps } from "./nodeOps";
import { createRenderer } from "@vue/runtime-core";


export const rendererOptions = extend({ patchProp }, nodeOps)

export const render = (vnode, container) => {
    return createRenderer(rendererOptions).render(vnode, container);
};

export * from "@vue/runtime-core";