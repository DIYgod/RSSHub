import { jsx as honoJsx } from 'hono/jsx/jsx-runtime';

import { toChild } from '.';

export type { JSX } from 'hono/jsx/jsx-runtime';
export { Fragment, jsxAttr, jsxEscape, jsxTemplate } from 'hono/jsx/jsx-runtime';

// Automatic runtime (`jsxImportSource` in tsconfig.json): every JSX expression in lib/ goes through here
export const jsx: typeof honoJsx = (tag, props, key) => {
    if (props && 'children' in props) {
        props.children = toChild(props.children);
    }
    return honoJsx(tag, props, key);
};

export { jsx as jsxs };
