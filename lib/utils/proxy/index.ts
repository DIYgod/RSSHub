import type { SecureVersion } from 'node:tls';

import { HttpsProxyAgent } from 'https-proxy-agent';
import { PacProxyAgent } from 'pac-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyAgent } from 'undici';

import { config } from '@/config';

import pacProxy from './pac-proxy';
import unifyProxy from './unify-proxy';

const proxyIsPAC = Boolean(config.pacUri || config.pacScript);

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

const dispatchers = new Map<string, ProxyAgent | null>();
const getCachedDispatcher = (uri: string, minVersion?: SecureVersion) => {
    const key = `${minVersion ?? ''} ${uri}`;
    if (!dispatchers.has(key)) {
        dispatchers.set(key, createDispatcher(uri, minVersion));
    }
    return dispatchers.get(key) ?? null;
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
    dispatcher = getCachedDispatcher(proxyUri);
}

const PAC_REFRESH_INTERVAL = 60 * 60 * 1000;
let pacRefreshAt = 0;

const getPacResolver = async (pacAgent: PacProxyAgent<string>) => {
    if (!pacAgent.resolver || Date.now() > pacRefreshAt) {
        try {
            await pacAgent.getResolver();
        } catch (error) {
            if (!pacAgent.resolver) {
                throw error;
            }
        }
        pacRefreshAt = Date.now() + PAC_REFRESH_INTERVAL;
    }
    return pacAgent.resolver!;
};

const PAC_SCHEMES = new Map<string, string | null>([
    ['DIRECT', null],
    ['PROXY', 'http'],
    ['HTTP', 'http'],
    ['HTTPS', 'https'],
    ['SOCKS', 'socks5'],
    ['SOCKS5', 'socks5'],
]);

const resolvePacProxy = async (pacAgent: PacProxyAgent<string>, url: string): Promise<string | null> => {
    let result: string | undefined;
    try {
        const resolver = await getPacResolver(pacAgent);
        result = await resolver(new URL(url));
    } catch (error) {
        throw new Error(`PAC proxy resolution failed for ${url}: ${error}`, { cause: error });
    }
    const entries = (result || 'DIRECT').trim().split(/\s*;\s*/);
    for (const entry of entries) {
        const [type, target] = entry.split(/\s+/, 2);
        const scheme = PAC_SCHEMES.get(type.toUpperCase());
        if (scheme !== undefined) {
            return scheme && `${scheme}://${target}`;
        }
    }
    throw new Error(`PAC returned no proxy type undici supports for ${url}: ${result}`);
};

const getDispatcher = async (url: string, minVersion?: SecureVersion) => {
    if (agent instanceof PacProxyAgent) {
        const uri = await resolvePacProxy(agent, url);
        return uri ? getCachedDispatcher(uri, minVersion) : null;
    }
    return proxyUri ? getCachedDispatcher(proxyUri, minVersion) : null;
};

export default {
    agent,
    dispatcher,
    proxyIsPAC,
    proxyUri,
    proxyObj,
    proxyUrlHandler,
    getDispatcher,
};
