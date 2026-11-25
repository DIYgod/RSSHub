import { jsx as honoJsx } from 'hono/jsx';

// hono's renderer walks any child object with a `length` as a list of children.
// Only arrays are lists of children; other plain objects render as nothing.
export const toChild = <T>(child: T): T => {
    if (Array.isArray(child)) {
        return child.map((c) => toChild(c)) as T;
    }
    if (typeof child === 'object' && child !== null && !(child as { isEscaped?: boolean }).isEscaped && !(child instanceof Promise)) {
        return null as T;
    }
    return child;
};

export const jsx: typeof honoJsx = (tag, props, ...children) => honoJsx(tag, props, ...toChild(children));

export { jsx as createElement };
