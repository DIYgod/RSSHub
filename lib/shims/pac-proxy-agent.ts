// Shim for pac-proxy-agent in Cloudflare Workers.
// pac-proxy-agent reads its QuickJS WebAssembly through `import.meta.resolve` as soon as the module is
// evaluated, and Workers have no `import.meta.resolve`, so importing the real package throws and breaks
// every route that imports `@/utils/proxy`. PAC proxies also need Node sockets, which Workers lack.
export class PacProxyAgent {
    constructor() {
        throw new Error('PAC proxies (PAC_URI or PAC_SCRIPT) are not supported on Cloudflare Workers');
    }
}
