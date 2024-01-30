import { config } from '@/config';

const proxyIsPAC = config.pacUri || config.pacScript;

import pacProxy from './pac-proxy';
import unifyProxy from './unify-proxy';

let proxyUri: string | undefined;
let proxyObj: Record<string, any> | undefined;
let proxyUrlHandler: URL | null = null;
if (proxyIsPAC) {
    const proxy = pacProxy(config.pacUri, config.pacScript, config.proxy);
    proxyUri = proxy.proxyUri;
    proxyObj = proxy.proxyObj;
    proxyUrlHandler = proxy.proxyUrlHandler;
} else {
    const proxy = unifyProxy(config.proxyUri, config.proxy);
    proxyUri = proxy.proxyUri;
    proxyObj = proxy.proxyObj;
    proxyUrlHandler = proxy.proxyUrlHandler;
}

let agent = null;
if (proxyIsPAC) {
    const { PacProxyAgent } = require('pac-proxy-agent');
    agent = new PacProxyAgent(`pac+${proxyUri}`);
} else if (proxyUri) {
    if (proxyUri.startsWith('http')) {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        agent = new HttpsProxyAgent(proxyUri);
    } else if (proxyUri.startsWith('socks')) {
        const { SocksProxyAgent } = require('socks-proxy-agent');
        agent = new SocksProxyAgent(proxyUri);
    }
}

export default {
    agent,
    proxyUri,
    proxyObj,
    proxyUrlHandler,
};
