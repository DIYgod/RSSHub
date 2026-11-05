// oxlint-disable unicorn/prefer-node-protocol -- 'node:module' is aliased to this file, the bare specifier reaches the runtime module
// Shim for node:module in Cloudflare Workers
import { createRequire as nativeCreateRequire } from 'module';

// Rolldown calls createRequire(import.meta.url), and import.meta.url is undefined in Workers ESM.
// The native createRequire rejects undefined, so default the path and delegate to the native module.
export const createRequire = (filename?: string | URL) => {
    const require = nativeCreateRequire(filename ?? 'file:///worker/index.mjs');
    return (id: string) => (id === 'process' || id === 'node:process' ? process : require(id));
};

export default { createRequire };
