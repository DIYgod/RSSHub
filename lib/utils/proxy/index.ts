import type { SecureVersion } from 'node:tls';

import { HttpsProxyAgent } from 'https-proxy-agent';
import { PacProxyAgent } from 'pac-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyAgent } from 'undici';

import { config } from '@/config';
import logger from '@/utils/logger';

import pacProxy from './pac-proxy';
import unifyProxy from './unify-proxy';

const proxyIsPAC = config.pacUri || config.pacScript;

const { proxyUri, proxyObj, proxyUrlHandler } = proxyIsPAC ? pacProxy(config.pacUri, config.pacScript, config.proxy) : unifyProxy(config.proxyUri, config.proxy);

const createDispatcher = (uri: string, minVersion?: SecureVersion): ProxyAgent | null => {
    if (uri.startsWith('http')) {
        return new ProxyAgent({
            uri,
            token: proxyObj?.auth ? `Basic ${proxyObj.auth}` : undefined,
            requestTls: {
                rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
                preferH2: true,
                minVersion,
            },
        });
    }
    if (uri.startsWith('socks')) {
        return new ProxyAgent({
            // undici only accepts socks5: and socks:, and its SOCKS5 client already lets the proxy resolve host names
            uri: uri.replace(/^socks5h:/, 'socks5:'),
            requestTls: {
                ALPNProtocols: ['h2', 'http/1.1'],
                minVersion,
            },
        });
    }
    return null;
};

let agent: PacProxyAgent<string> | HttpsProxyAgent<string> | SocksProxyAgent | null = null;
let dispatcher: ProxyAgent | null = null;

if (proxyIsPAC && proxyUri) {
    agent = new PacProxyAgent(`pac+${proxyUri}`);
} else if (proxyUri) {
    if (proxyUri.startsWith('http')) {
        agent = new HttpsProxyAgent(proxyUri, {
            headers: {
                'proxy-authorization': proxyObj?.auth ? `Basic ${proxyObj.auth}` : undefined,
            },
        });
    } else if (proxyUri.startsWith('socks')) {
        agent = new SocksProxyAgent(proxyUri);
    }
    dispatcher = createDispatcher(proxyUri);
}

// Only the first PAC entry is used; undici has no per-connection fallback like pac-proxy-agent
const resolvePacProxy = async (pacAgent: PacProxyAgent<string>, url: string): Promise<string | null> => {
    const resolver = await pacAgent.getResolver();
    const result = (await resolver(new URL(url))) || 'DIRECT';
    const [type, target] = result
        .trim()
        .split(/\s*;\s*/, 1)[0]
        .split(/\s+/, 2);
    switch (type) {
        case 'PROXY':
        case 'HTTP':
            return `http://${target}`;
        case 'HTTPS':
            return `https://${target}`;
        case 'SOCKS':
        case 'SOCKS5':
            return `socks5://${target}`;
        case 'DIRECT':
            return null;
        default:
            logger.warn(`Unsupported PAC proxy type ${type} for ${url}, connecting directly`);
            return null;
    }
};

const getDispatcher = async (url: string, minVersion?: SecureVersion) => {
    if (agent instanceof PacProxyAgent) {
        const uri = await resolvePacProxy(agent, url);
        return uri ? createDispatcher(uri, minVersion) : null;
    }
    return minVersion && proxyUri ? createDispatcher(proxyUri, minVersion) : dispatcher;
};

export default {
    agent,
    dispatcher,
    proxyUri,
    proxyObj,
    proxyUrlHandler,
    getDispatcher,
};
