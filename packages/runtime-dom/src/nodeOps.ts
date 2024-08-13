export const svgNS = 'http://www.w3.org/2000/svg'
export const mathmlNS = 'http://www.w3.org/1998/Math/MathML'

export const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null);
    },
    remove: (child) => {
        const parent = child.parent;
        if (parent) {
            parent.removeChild(child)
        }
    },
    createElement: (tag, namespace, is, props) => {
        const el = namespace === 'svg' ?
            document.createElementNS(svgNS, tag) :
            namespace === 'mathml' ?
                document.createElementNS(mathmlNS, tag) :
                is ? document.createElement(tag, {is}):
                document.createElement(tag);

        if (tag === 'select' && props && props.multiple != null) {
            el.setAttribute('multiple', props.multiple);
        }
        return el
    },
    createText: text => document.createTextNode(text),
    createComment: text => document.createComment(text),
    setText: (node, text) => node.nodeValue = text,
    setElementText: (el, text) => el.textContent = text,
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => document.querySelector(selector),
    setScopeId: (el, id) => el.setAttribute(id, ''),
    
}