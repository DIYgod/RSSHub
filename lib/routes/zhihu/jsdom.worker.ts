import type { createJSDOMClient as createNodeJSDOMClient } from './jsdom';

// Exclude JSDOM from Worker bundles, including unreachable dynamic import chunks.
export const createJSDOMClient: typeof createNodeJSDOMClient = () => {
    throw new Error('zhihu: JSDOM session initialization is unavailable on Workers; use a browser session');
};
