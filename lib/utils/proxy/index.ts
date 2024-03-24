import { config } from '@/config';
import { PacProxyAgent } from 'pac-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

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

let agent: PacProxyAgent<string> | HttpsProxyAgent<string> | SocksProxyAgent | null = null;
if (proxyIsPAC) {
    agent = new PacProxyAgent(`pac+${proxyUri}`);
} else if (proxyUri) {
    if (proxyUri.startsWith('http')) {
        agent = new HttpsProxyAgent(proxyUri);
    } else if (proxyUri.startsWith('socks')) {
        agent = new SocksProxyAgent(proxyUri);
    }
}

export default {
    agent,
    proxyUri,
    proxyObj,
    proxyUrlHandler,
};
