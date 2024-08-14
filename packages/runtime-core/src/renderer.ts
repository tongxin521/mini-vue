import { ShapeFlags } from "@vue/shared";
import { isSameVNodeType } from "./vnode";

export function createRenderer(options) {
    return baseCreateRenderer(options)
}


function baseCreateRenderer(options) {
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
      } = options

      

      const patch = (n1, n2, container) => {
        if (n1 == n2) {
            return;
        }

        // if (n1 && !isSameVNodeType(n1, n2)) {
        //     unmount(n1)
        //     n1 = null
        // }

        const { type, ref, shapeFlag } = n2
        if (shapeFlag & ShapeFlags.ELEMENT) {
            processElement(n1, n2, container)
        }
      }

      const processElement = (n1, n2, container) => {
        if (n1 == null) {
            mountElement(n2, container)
        }
      }

      const mountElement = (vnode, container) => {
        const { type, props, shapeFlag } = vnode;
        const el = (vnode.el = hostCreateElement(type));
        // 说明子节点是文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, vnode.children)
        }

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el)
        }

        if (props) {
            for (const key in props) {
              hostPatchProp(el, key, null, props[key])
            }
        }
      }

      const mountChildren = (vnode, container) => {
        for (let i = 0; i < vnode.children.length; i++) {
            const child = vnode.children[i]
            patch(null, child, container)
        }
        
      }
      const render = (vnode, container) => {
        if (vnode == null) {
            if (container._vnode != null) {
                // unmount(container._vnode, null, null, true)
            }
        }
        else {
            patch(container._vnode || null, vnode, container)   
        }
        container._vnode = vnode
      }

      return { render }
}

